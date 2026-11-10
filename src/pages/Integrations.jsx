import { __, sprintf } from '@wordpress/i18n';
import { api, errMsg } from '../api';
import { navigate } from '../router';
import { Button, Card, Confirm, Empty, Icon, LinkButton, Notice, SourceLogo, Spinner, Toggle, useAsync, useToast, timeAgo } from '../components/ui';

const { useState } = wp.element;

export default function Integrations() {
	const toast = useToast();
	const [{ loading, data, error }, reload, setState] = useAsync(() => api.feeds());
	const [confirm, setConfirm] = useState(null);
	const [testing, setTesting] = useState(0);

	const toggle = async (feed, status) => {
		setState((s) => ({ ...s, data: s.data.map((f) => (f.id === feed.id ? { ...f, status } : f)) }));
		try {
			await api.toggleFeed(feed.id, status);
			toast(status ? __( 'Integration enabled', 'quicksheet' ) : __( 'Integration paused', 'quicksheet' ));
		} catch (e) {
			toast(errMsg(e), 'error');
			reload();
		}
	};

	const test = async (feed) => {
		let data = {};
		if (feed.action === 'whatsapp' && /\{field:/.test((feed.settings && feed.settings.recipient) || '')) {
			// eslint-disable-next-line no-alert
			const recipient = window.prompt(__( 'Send the test WhatsApp message to which number? (international format)', 'quicksheet' ), '');
			if (!recipient) return;
			data = { recipient };
		}
		setTesting(feed.id);
		try {
			const res = await api.testFeed(feed.id, data);
			toast(res.message || __( 'Test sent', 'quicksheet' ));
		} catch (e) {
			toast(errMsg(e), 'error');
		} finally {
			setTesting(0);
		}
	};

	if (loading) return <Spinner label={__( 'Loading integrations…', 'quicksheet' )} />;
	if (error) return <Notice tone="error">{error.message}</Notice>;

	return (
		<div className="qs-page">
			<div className="qs-pagehead">
				<div>
					<h1>{__( 'Integrations', 'quicksheet' )}</h1>
					<p>{__( 'Each integration runs one action whenever a form is submitted.', 'quicksheet' )}</p>
				</div>
			</div>

			{data.length === 0 ? (
				<Card>
					<Empty
						icon="link"
						title={__( 'No integrations yet', 'quicksheet' )}
						action={<LinkButton variant="primary" icon="plus" href="#/integrations/new">{__( 'Create your first integration', 'quicksheet' )}</LinkButton>}
					>
						{__( 'Send Contact Form 7, WPForms or Elementor submissions to Google Sheets, WhatsApp, Discord or your Facebook Page.', 'quicksheet' )}
					</Empty>
				</Card>
			) : (
				<Card className="qs-card--flush">
					<div className="qs-table-wrap">
						<table className="qs-table">
							<thead>
								<tr>
									<th>{__( 'Integration', 'quicksheet' )}</th>
									<th>{__( 'Trigger', 'quicksheet' )}</th>
									<th aria-hidden="true" />
									<th>{__( 'Action', 'quicksheet' )}</th>
									<th>{__( 'Active', 'quicksheet' )}</th>
									<th aria-label={__( 'Actions', 'quicksheet' )} />
								</tr>
							</thead>
							<tbody>
								{data.map((f) => (
									<tr key={f.id} className={f.status ? '' : 'is-muted'}>
										<td>
											<a className="qs-table__title" href={`#/integrations/${f.id}`}>{f.name}</a>
											<span className="qs-table__sub">{/* translators: %s: relative time, e.g. 5 min ago */ sprintf( __( 'Updated %s', 'quicksheet' ), timeAgo(f.updated_at) )}</span>
										</td>
										<td>
											<div className="qs-inline">
												<SourceLogo source={f.source} size={26} />
												<div>
													<div>{f.form_title || `#${f.form_id}`}</div>
													<span className="qs-table__sub">{f.source_label}</span>
												</div>
											</div>
										</td>
										<td className="qs-maptable__arrow"><Icon name="arrow" size={14} /></td>
										<td>
											<div className="qs-inline qs-inline--nowrap">
												<SourceLogo source={f.action} size={26} />
												<div>
													{f.action === 'google_sheets' ? (
														<a className="qs-sheetlink" href={`https://docs.google.com/spreadsheets/d/${f.spreadsheet_id}/edit`} target="_blank" rel="noopener noreferrer">
															{f.spreadsheet_name || __( 'Spreadsheet', 'quicksheet' )}
															<Icon name="external" size={12} />
														</a>
													) : <div>{f.action_label}</div>}
													<span className="qs-table__sub">{f.action === 'google_sheets' ? /* translators: %s: sheet tab name */ sprintf( __( 'Tab: %s', 'quicksheet' ), f.sheet_name ) : f.account_name || __( 'Account missing', 'quicksheet' )}</span>
												</div>
											</div>
										</td>
										<td><Toggle checked={f.status} onChange={(v) => toggle(f, v)} ariaLabel={/* translators: %s: integration name */ sprintf( __( 'Activate %s', 'quicksheet' ), f.name )} /></td>
										<td className="qs-table__actions">
											<Button size="sm" icon="play" loading={testing === f.id} onClick={() => test(f)} title={__( 'Send test data', 'quicksheet' )}>{__( 'Test', 'quicksheet' )}</Button>
											<Button size="sm" icon="edit" onClick={() => navigate(`/integrations/${f.id}`)} aria-label={__( 'Edit', 'quicksheet' )} />
											<Button size="sm" variant="ghost-danger" icon="trash" onClick={() => setConfirm(f)} aria-label={__( 'Delete', 'quicksheet' )} />
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</Card>
			)}

			{confirm && (
				<Confirm
					title={__( 'Delete integration?', 'quicksheet' )}
					onCancel={() => setConfirm(null)}
					onConfirm={async () => {
						try {
							await api.deleteFeed(confirm.id);
							toast(__( 'Integration deleted', 'quicksheet' ));
							setConfirm(null);
							reload();
						} catch (e) {
							toast(errMsg(e), 'error');
						}
					}}
				>
					<p>
						<strong>{confirm.name}</strong> {__( 'will stop running. Data already sent is not affected.', 'quicksheet' )}
					</p>
				</Confirm>
			)}
		</div>
	);
}
