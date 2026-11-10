import { __, sprintf } from '@wordpress/i18n';
import { api, errMsg } from '../api';
import { Button, Card, Confirm, Icon, Notice, Pill, SourceLogo, Spinner, timeAgo, useAsync, useToast } from '../components/ui';
import GoogleAccount from '../components/GoogleAccount';
import AccountModal from '../components/AccountModal';

const { useState } = wp.element;

const CATEGORY = {
	productivity: __( 'Spreadsheets', 'quicksheet' ),
	chat: __( 'Messaging', 'quicksheet' ),
	social: __( 'Social media', 'quicksheet' ),
};

const AppCard = ({ app, onAdd, onDelete, onVerify, verifying }) => (
	<Card className="qs-appbox">
		<div className="qs-appbox__head">
			<SourceLogo source={app.slug} size={44} />
			<div className="qs-appbox__title">
				<h2>{app.label}</h2>
				<span className="qs-muted">{CATEGORY[app.category] || app.category}</span>
			</div>
			{app.accounts.length ? <Pill tone="success">{/* translators: %d: number of connected accounts */ sprintf( __( '%d connected', 'quicksheet' ), app.accounts.length )}</Pill> : <Pill>{__( 'Not connected', 'quicksheet' )}</Pill>}
		</div>
		<p className="qs-appbox__desc">{app.description}</p>
		{app.accounts.length > 0 && (
			<ul className="qs-accounts">
				{app.accounts.map((acc) => (
					<li key={acc.id}>
						<Icon name="user" size={14} />
						<span className="qs-accounts__name">{acc.name}</span>
						<span className="qs-muted qs-accounts__date">{timeAgo(acc.created_at)}</span>
						<Button size="sm" icon="refresh" loading={verifying === acc.id} onClick={() => onVerify(acc)} aria-label={/* translators: %s: account name */ sprintf( __( 'Check %s', 'quicksheet' ), acc.name )} title={__( 'Check connection', 'quicksheet' )} />
						<Button size="sm" variant="ghost-danger" icon="trash" onClick={() => onDelete(acc)} aria-label={/* translators: %s: account name */ sprintf( __( 'Remove %s', 'quicksheet' ), acc.name )} />
					</li>
				))}
			</ul>
		)}
		<div className="qs-appbox__foot">
			<Button variant={app.accounts.length ? 'secondary' : 'primary'} icon="plus" onClick={() => onAdd(app)}>{app.accounts.length ? __( 'Add another', 'quicksheet' ) : __( 'Connect', 'quicksheet' )}</Button>
			{app.docs_url && <a className="qs-link" href={app.docs_url} target="_blank" rel="noopener noreferrer">{__( 'Setup guide', 'quicksheet' )} <Icon name="external" size={12} /></a>}
		</div>
	</Card>
);

export default function Apps() {
	const toast = useToast();
	const [{ loading, data, error }, reload] = useAsync(() => api.actions());
	const [modal, setModal] = useState(null);
	const [confirm, setConfirm] = useState(null);
	const [verifying, setVerifying] = useState(0);

	const verify = async (acc) => {
		setVerifying(acc.id);
		try {
			const res = await api.verifyAccount(acc.id);
			toast(/* translators: %s: account name */ sprintf( __( '%s is working', 'quicksheet' ), res.name ));
		} catch (e) {
			toast(errMsg(e), 'error');
		} finally {
			setVerifying(0);
		}
	};

	if (loading) return <Spinner label={__( 'Loading apps…', 'quicksheet' )} />;
	if (error) return <Notice tone="error">{errMsg(error)}</Notice>;

	const accountApps = data.filter((a) => a.uses_accounts);

	return (
		<div className="qs-page">
			<div className="qs-pagehead">
				<div>
					<h1>{__( 'Apps', 'quicksheet' )}</h1>
					<p>{__( 'Connect the apps your integrations send data to. Credentials are verified with the provider and stored encrypted.', 'quicksheet' )}</p>
				</div>
			</div>

			<GoogleAccount />

			<div className="qs-appboxes">
				{accountApps.map((a) => (
					<AppCard key={a.slug} app={a} onAdd={setModal} onDelete={setConfirm} onVerify={verify} verifying={verifying} />
				))}
			</div>

			{modal && (
				<AccountModal
					app={modal}
					onClose={() => setModal(null)}
					onSaved={(acc) => { setModal(null); toast(/* translators: %s: account name */ sprintf( __( '%s connected', 'quicksheet' ), acc.name )); reload(); }}
				/>
			)}
			{confirm && (
				<Confirm
					title={__( 'Remove account?', 'quicksheet' )}
					confirmLabel={__( 'Remove', 'quicksheet' )}
					onCancel={() => setConfirm(null)}
					onConfirm={async () => {
						try {
							await api.deleteAccount(confirm.id);
							toast(__( 'Account removed', 'quicksheet' ));
							setConfirm(null);
							reload();
						} catch (e) {
							toast(errMsg(e), 'error');
							setConfirm(null);
						}
					}}
				>
					<p><strong>{confirm.name}</strong> {__( 'and its saved credentials will be deleted from this site.', 'quicksheet' )}</p>
				</Confirm>
			)}
		</div>
	);
}
