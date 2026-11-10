import { __, sprintf } from '@wordpress/i18n';
import { api, errMsg } from '../api';
import { Button, Field, Icon, Notice, SourceLogo } from './ui';

const { useState } = wp.element;
const { Modal } = wp.components;

/**
 * Add an account for an app. Credentials are verified with the provider before they are saved.
 */
export default function AccountModal({ app, onClose, onSaved }) {
	const [values, setValues] = useState({});
	const [name, setName] = useState('');
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState('');

	const submit = async (e) => {
		e.preventDefault();
		setBusy(true);
		setError('');
		try {
			const account = await api.addAccount({ service: app.slug, name, credentials: values });
			onSaved(account);
		} catch (err) {
			setError(errMsg(err));
		} finally {
			setBusy(false);
		}
	};

	return (
		<Modal title={/* translators: %s: app name */ sprintf( __( 'Connect %s', 'quicksheet' ), app.label )} onRequestClose={onClose} className="qs-modal qs-modal--form">
			<form onSubmit={submit} className="qs-modal__form">
				<div className="qs-modal__app">
					<SourceLogo source={app.slug} size={36} />
					<p>{app.description}</p>
				</div>
				{app.account_fields.map((f) => (
					<Field key={f.key} label={f.label} help={f.help} htmlFor={`qs-acc-${f.key}`}>
						<input
							id={`qs-acc-${f.key}`}
							className="qs-input qs-input--mono"
							type={f.type === 'password' ? 'password' : 'text'}
							placeholder={f.placeholder}
							value={values[f.key] || ''}
							onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
							autoComplete="off"
							required
						/>
					</Field>
				))}
				<Field label={__( 'Account name (optional)', 'quicksheet' )} htmlFor="qs-acc-name" help={__( 'Defaults to the name returned by the provider.', 'quicksheet' )}>
					<input id="qs-acc-name" className="qs-input" value={name} onChange={(e) => setName(e.target.value)} />
				</Field>
				{error && <Notice tone="error">{error}</Notice>}
				{app.docs_url && (
					<a className="qs-link" href={app.docs_url} target="_blank" rel="noopener noreferrer">
						{__( 'How to get these credentials', 'quicksheet' )} <Icon name="external" size={12} />
					</a>
				)}
				<div className="qs-modal__foot">
					<Button onClick={onClose}>{__( 'Cancel', 'quicksheet' )}</Button>
					<Button type="submit" variant="primary" icon="check" loading={busy}>{__( 'Verify & save', 'quicksheet' )}</Button>
				</div>
			</form>
		</Modal>
	);
}
