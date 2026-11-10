import { __, sprintf } from '@wordpress/i18n';
import { api, errMsg } from '../api';
import { Button, Card, Confirm, CopyField, Field, Icon, Notice, Pill, Spinner, useAsync, useToast } from './ui';

const { useState, useEffect, createInterpolateElement } = wp.element;

const ext = (href) => <a href={href} target="_blank" rel="noopener noreferrer" />;

// Translatable setup steps; tags are mapped to elements by createInterpolateElement.
const GUIDE = [
	[__( 'Open the <console>Google Cloud Console</console> and create (or select) a project.', 'quicksheet' ), { console: ext('https://console.cloud.google.com/projectcreate') }],
	[__( 'Enable the <sheets>Google Sheets API</sheets> and the <drive>Google Drive API</drive>.', 'quicksheet' ), { sheets: ext('https://console.cloud.google.com/apis/library/sheets.googleapis.com'), drive: ext('https://console.cloud.google.com/apis/library/drive.googleapis.com') }],
	[__( 'Under <strong>OAuth consent screen</strong>, choose <em>External</em>, fill in the app name and your email, and add yourself as a test user.', 'quicksheet' ), {}],
	[__( 'Go to <creds>Credentials</creds> → <strong>Create credentials</strong> → <strong>OAuth client ID</strong> → <em>Web application</em>.', 'quicksheet' ), { creds: ext('https://console.cloud.google.com/apis/credentials') }],
	[__( 'Paste the <strong>Authorized redirect URI</strong> shown here, click Create, and copy the Client ID and Client Secret into the form.', 'quicksheet' ), {}],
];
const renderStep = ([text, map]) => createInterpolateElement(text, { strong: <strong />, em: <em />, ...map });

const GoogleAccount = ({ onChange }) => {
	const toast = useToast();
	const [{ loading, data, error }, reload, setState] = useAsync(() => api.status());
	const [form, setForm] = useState({ client_id: '', client_secret: '' });
	const [saving, setSaving] = useState(false);
	const [confirm, setConfirm] = useState(false);
	const [editing, setEditing] = useState(false);
	const notice = window.QSWP.notice;

	const clientId = data ? data.client_id || '' : null;
	useEffect(() => {
		if (clientId !== null) setForm({ client_id: clientId, client_secret: '' });
	}, [clientId]);

	if (loading) return <Card title={__( 'Google Sheets', 'quicksheet' )}><Spinner /></Card>;
	if (error) return <Notice tone="error">{errMsg(error)}</Notice>;

	const saveCreds = async (e) => {
		e.preventDefault();
		setSaving(true);
		try {
			const res = await api.saveCredentials(form);
			setState({ loading: false, data: res, error: null });
			if (onChange) onChange(res);
			setEditing(false);
			toast(__( 'Credentials saved', 'quicksheet' ));
		} catch (err) {
			toast(errMsg(err), 'error');
		} finally {
			setSaving(false);
		}
	};

	const showForm = !data.configured || editing;

	return (
		<>
			{notice.error && <Notice tone="error">{/* translators: %s: error message from Google */ sprintf( __( 'Google authorization failed: %s', 'quicksheet' ), notice.error )}</Notice>}
			{notice.connected && data.connected && <Notice tone="success">{__( 'Google account connected successfully.', 'quicksheet' )}</Notice>}
			{data.last_error && <Notice tone="error">{data.last_error}</Notice>}

			<Card
				title={__( 'Google Sheets', 'quicksheet' )}
				subtitle={__( 'Uses your own Google Cloud OAuth app, so data goes straight from your site to Google.', 'quicksheet' )}
				actions={data.connected ? <Pill tone="success">{__( 'Connected', 'quicksheet' )}</Pill> : data.configured ? <Pill tone="warning">{__( 'Not authorized', 'quicksheet' )}</Pill> : <Pill>{__( 'Not configured', 'quicksheet' )}</Pill>}
			>
				{data.connected ? (
					<div className="qs-account">
						<span className="qs-account__avatar"><Icon name="google" size={22} /></span>
						<div className="qs-account__info">
							<strong>{data.email || __( 'Google account', 'quicksheet' )}</strong>
							<span>{/* translators: %s: date and time the account was connected */ sprintf( __( 'Connected %s', 'quicksheet' ), data.connected_at )}</span>
						</div>
						<div className="qs-account__actions">
							<a className="qs-btn qs-btn--secondary" href={data.connect_url}><Icon name="refresh" /><span>{__( 'Reconnect', 'quicksheet' )}</span></a>
							<Button variant="ghost-danger" onClick={() => setConfirm(true)}>{__( 'Disconnect', 'quicksheet' )}</Button>
						</div>
					</div>
				) : data.configured && !editing ? (
					<div className="qs-connect">
						<p>{__( 'Credentials saved. Authorize QuickSheet to read your spreadsheet list and add rows.', 'quicksheet' )}</p>
						<a className="qs-btn qs-btn--google" href={data.connect_url}>
							<Icon name="google" size={18} />
							<span>{__( 'Connect with Google', 'quicksheet' )}</span>
						</a>
					</div>
				) : null}

				{showForm && (
					<div className="qs-setup">
						<ol className="qs-guide">
							{GUIDE.map((g, i) => <li key={i}>{renderStep(g)}</li>)}
						</ol>
						<form className="qs-setup__form" onSubmit={saveCreds}>
							<Field label={__( 'Authorized redirect URI', 'quicksheet' )} help={__( 'Add this exact URL to your OAuth client.', 'quicksheet' )}>
								<CopyField value={data.redirect_uri} />
							</Field>
							<Field label={__( 'Client ID', 'quicksheet' )} htmlFor="qs-cid">
								<input id="qs-cid" className="qs-input qs-input--mono" value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} placeholder="1234567890-abc.apps.googleusercontent.com" required autoComplete="off" />
							</Field>
							<Field label={__( 'Client Secret', 'quicksheet' )} htmlFor="qs-secret" help={data.has_secret ? __( 'Leave blank to keep the saved secret. Stored encrypted.', 'quicksheet' ) : __( 'Stored encrypted in your database.', 'quicksheet' )}>
								<input id="qs-secret" type="password" className="qs-input qs-input--mono" value={form.client_secret} onChange={(e) => setForm({ ...form, client_secret: e.target.value })} placeholder={data.has_secret ? '••••••••••••' : 'GOCSPX-…'} required={!data.has_secret} autoComplete="new-password" />
							</Field>
							<div className="qs-inline">
								<Button type="submit" variant="primary" loading={saving}>{__( 'Save credentials', 'quicksheet' )}</Button>
								{editing && <Button onClick={() => setEditing(false)}>{__( 'Cancel', 'quicksheet' )}</Button>}
							</div>
						</form>
					</div>
				)}

				{data.configured && !editing && (
					<p className="qs-foot-link">
						<button type="button" className="qs-linkbtn" onClick={() => setEditing(true)}>{__( 'Change OAuth credentials', 'quicksheet' )}</button>
					</p>
				)}
			</Card>

			{confirm && (
				<Confirm
					title={__( 'Disconnect Google?', 'quicksheet' )}
					confirmLabel={__( 'Disconnect', 'quicksheet' )}
					onCancel={() => setConfirm(false)}
					onConfirm={async () => {
						try {
							const res = await api.disconnect();
							setState({ loading: false, data: res, error: null });
							if (onChange) onChange(res);
							toast(__( 'Google account disconnected', 'quicksheet' ));
						} catch (err) {
							toast(errMsg(err), 'error');
						} finally {
							setConfirm(false);
						}
					}}
				>
					<p>{__( 'Google Sheets integrations will stop sending rows until you reconnect. Failed submissions are kept in the log so you can retry them later.', 'quicksheet' )}</p>
				</Confirm>
			)}
		</>
	);
};

export default GoogleAccount;
