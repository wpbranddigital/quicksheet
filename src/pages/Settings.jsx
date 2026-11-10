import { __ } from '@wordpress/i18n';
import { api, errMsg } from '../api';
import { Button, Card, Notice, Spinner, Toggle, useAsync, useToast } from '../components/ui';

const { useState } = wp.element;

const General = () => {
	const toast = useToast();
	const [{ loading, data, error }, , setState] = useAsync(() => api.settings());
	const [saving, setSaving] = useState(false);
	if (error) return <Card title={__( 'General', 'quicksheet' )}><Notice tone="error">{errMsg(error)}</Notice></Card>;
	if (loading || !data) return <Card title={__( 'General', 'quicksheet' )}><Spinner /></Card>;

	const set = (patch) => setState((s) => ({ ...s, data: { ...s.data, ...patch } }));
	const save = async () => {
		setSaving(true);
		try {
			const res = await api.saveSettings(data);
			setState({ loading: false, data: res, error: null });
			toast(__( 'Settings saved', 'quicksheet' ));
		} catch (e) {
			toast(errMsg(e), 'error');
		} finally {
			setSaving(false);
		}
	};

	return (
		<Card title={__( 'General', 'quicksheet' )} subtitle={__( 'Delivery, retries and formatting', 'quicksheet' )}>
			<div className="qs-settings">
				<div className="qs-setting">
					<div>
						<strong>{__( 'Automatic retry', 'quicksheet' )}</strong>
						<p>{__( 'If Google is unreachable, retry failed rows in the background (5, 10, 15… minutes).', 'quicksheet' )}</p>
					</div>
					<Toggle checked={data.auto_retry} onChange={(v) => set({ auto_retry: v })} ariaLabel={__( 'Automatic retry', 'quicksheet' )} />
				</div>
				{data.auto_retry && (
					<div className="qs-setting">
						<div>
							<strong>{__( 'Maximum retries', 'quicksheet' )}</strong>
							<p>{__( 'After this many attempts, the row is marked as failed for manual retry.', 'quicksheet' )}</p>
						</div>
						<input type="number" min="0" max="10" className="qs-input qs-input--sm" value={data.max_retries} onChange={(e) => set({ max_retries: e.target.value })} />
					</div>
				)}
				<div className="qs-setting">
					<div>
						<strong>{__( 'Keep successful logs for', 'quicksheet' )}</strong>
						<p>{__( 'Failed entries are never purged automatically.', 'quicksheet' )}</p>
					</div>
					<div className="qs-inline">
						<input type="number" min="1" max="365" className="qs-input qs-input--sm" value={data.log_retention_days} onChange={(e) => set({ log_retention_days: e.target.value })} />
						<span>{__( 'days', 'quicksheet' )}</span>
					</div>
				</div>
				<div className="qs-setting">
					<div>
						<strong>{__( 'Protect against formula injection', 'quicksheet' )}</strong>
						<p>{__( 'Values starting with =, +, - or @ are stored as plain text. Also keeps phone numbers like +8801… intact.', 'quicksheet' )}</p>
					</div>
					<Toggle checked={data.escape_formulas} onChange={(v) => set({ escape_formulas: v })} ariaLabel={__( 'Protect against formula injection', 'quicksheet' )} />
				</div>
				<div className="qs-setting">
					<div>
						<strong>{__( 'Date & time format', 'quicksheet' )}</strong>
						<p>{__( 'Used by the {date}, {time} and {datetime} smart tags (PHP date format).', 'quicksheet' )}</p>
					</div>
					<div className="qs-inline">
						<input className="qs-input qs-input--sm qs-input--mono" value={data.date_format} onChange={(e) => set({ date_format: e.target.value })} aria-label={__( 'Date format', 'quicksheet' )} />
						<input className="qs-input qs-input--sm qs-input--mono" value={data.time_format} onChange={(e) => set({ time_format: e.target.value })} aria-label={__( 'Time format', 'quicksheet' )} />
					</div>
				</div>
			</div>
			<div className="qs-card__footer">
				<Button variant="primary" loading={saving} onClick={save}>{__( 'Save settings', 'quicksheet' )}</Button>
			</div>
		</Card>
	);
};

export default function Settings() {
	return (
		<div className="qs-page">
			<div className="qs-pagehead">
				<div>
					<h1>{__( 'Settings', 'quicksheet' )}</h1>
					<p>{__( 'Fine-tune delivery, retries and formatting. App accounts live under', 'quicksheet' )} <a href="#/apps">{__( 'Apps', 'quicksheet' )}</a>.</p>
				</div>
			</div>
			<General />
		</div>
	);
}
