import { __, sprintf } from '@wordpress/i18n';
import { api, errMsg } from '../api';
import { Button, Card, Confirm, Empty, Notice, SourceLogo, Spinner, StatusPill, colLetter, timeAgo, useAsync, useToast } from '../components/ui';

const { useState, Fragment } = wp.element;

/** Flatten nested payloads (WhatsApp/Discord/Facebook) into readable key → value pairs. */
const flatten = (obj, prefix = '') => Object.entries(obj).reduce((acc, [k, v]) => {
	const key = prefix ? `${prefix}.${k}` : k;
	if (v && typeof v === 'object') return acc.concat(flatten(v, key));
	return acc.concat([[key, v]]);
}, []);

const PayloadView = ({ data }) => {
	if (Array.isArray(data)) {
		return (
			<div className="qs-rowdata">
				{data.map((v, i) => (
					<div key={i} className="qs-rowdata__cell">
						<span className="qs-col">{colLetter(i)}</span>
						<span className={v === '' ? 'qs-muted' : ''}>{v === '' ? __( 'empty', 'quicksheet' ) : String(v)}</span>
					</div>
				))}
			</div>
		);
	}
	const rows = flatten(data || {}).filter(([k]) => !/^(messaging_product|recipient_type|allowed_mentions|preview_url)/.test(k) && !k.endsWith('preview_url'));
	return (
		<dl className="qs-payload">
			{rows.map(([k, v]) => (
				<div key={k}><dt>{k}</dt><dd>{String(v)}</dd></div>
			))}
		</dl>
	);
};

const FILTERS = [
	['', __( 'All', 'quicksheet' )],
	['success', __( 'Sent', 'quicksheet' )],
	['failed', __( 'Failed', 'quicksheet' )],
	['pending', __( 'Retrying', 'quicksheet' )],
];

export default function Logs() {
	const toast = useToast();
	const [status, setStatus] = useState('');
	const [page, setPage] = useState(1);
	const [open, setOpen] = useState(0);
	const [busy, setBusy] = useState(0);
	const [confirmClear, setConfirmClear] = useState(false);
	const [retryingAll, setRetryingAll] = useState(false);
	const [{ loading, data, error }, reload] = useAsync(() => api.logs({ status, page, per_page: 20 }), [status, page]);

	const retry = async (log) => {
		setBusy(log.id);
		try {
			const res = await api.retryLog(log.id);
			// The server returns the app-specific result (e.g. "Message posted to Discord …").
			toast(res.message || (res.status === 'success' ? __( 'Sent', 'quicksheet' ) : __( 'Retry failed', 'quicksheet' )), res.status === 'success' ? 'success' : 'error');
		} catch (e) {
			toast(errMsg(e), 'error');
		} finally {
			setBusy(0);
			reload();
		}
	};

	const retryAll = async () => {
		setRetryingAll(true);
		try {
			const r = await api.retryFailed();
			toast(/* translators: 1: number sent, 2: number still failing */ sprintf( __( '%1$d sent, %2$d still failing', 'quicksheet' ), r.success, r.failed ), r.failed ? 'error' : 'success');
		} catch (e) {
			toast(errMsg(e), 'error');
		} finally {
			setRetryingAll(false);
			reload();
		}
	};

	const remove = async (log) => {
		try {
			await api.deleteLog(log.id);
			reload();
		} catch (e) {
			toast(errMsg(e), 'error');
		}
	};

	return (
		<div className="qs-page">
			<div className="qs-pagehead">
				<div>
					<h1>{__( 'Submission logs', 'quicksheet' )}</h1>
					<p>{__( "Every delivery attempt to every app. Failed entries are kept until they're sent, so no lead gets lost.", 'quicksheet' )}</p>
				</div>
				<div className="qs-pagehead__actions">
					<Button icon="retry" loading={retryingAll} onClick={retryAll}>{__( 'Retry all failed', 'quicksheet' )}</Button>
					<Button variant="ghost-danger" icon="trash" onClick={() => setConfirmClear(true)}>{__( 'Clear logs', 'quicksheet' )}</Button>
				</div>
			</div>

			<div className="qs-filters" role="tablist">
				{FILTERS.map(([k, l]) => (
					<button key={k} type="button" role="tab" aria-selected={status === k} className={status === k ? 'is-active' : ''} onClick={() => { setStatus(k); setPage(1); }}>
						{l}
					</button>
				))}
			</div>

			{error && <Notice tone="error">{error.message}</Notice>}

			<Card className="qs-card--flush">
				{loading && !data ? (
					<Spinner label={__( 'Loading logs…', 'quicksheet' )} />
				) : !data || data.items.length === 0 ? (
					<Empty icon="clock" title={__( 'Nothing here yet', 'quicksheet' )}>{__( 'Submissions from connected forms will appear here.', 'quicksheet' )}</Empty>
				) : (
					<div className="qs-table-wrap">
						<table className="qs-table qs-logtable">
							<thead>
								<tr>
									<th>{__( 'Status', 'quicksheet' )}</th>
									<th>{__( 'Integration', 'quicksheet' )}</th>
									<th>{__( 'Details', 'quicksheet' )}</th>
									<th>{__( 'Attempts', 'quicksheet' )}</th>
									<th>{__( 'Time', 'quicksheet' )}</th>
									<th aria-label={__( 'Actions', 'quicksheet' )} />
								</tr>
							</thead>
							<tbody>
								{data.items.map((l) => (
									<Fragment key={l.id}>
										<tr className={open === l.id ? 'is-open' : ''}>
											<td><StatusPill status={l.status} /></td>
											<td>
												<div className="qs-inline qs-inline--nowrap">
													<SourceLogo source={l.action || 'google_sheets'} size={24} />
													<div>
														<span className="qs-table__title">{l.feed_name || /* translators: %d: integration ID */ sprintf( __( 'Integration #%d', 'quicksheet' ), l.feed_id )}</span>
														<span className="qs-table__sub">#{l.id}</span>
													</div>
												</div>
											</td>
											<td className="qs-logtable__msg">{l.message}</td>
											<td>{l.attempts}</td>
											<td title={l.created_at}>{timeAgo(l.created_at)}</td>
											<td className="qs-table__actions">
												<Button size="sm" icon="eye" onClick={() => setOpen(open === l.id ? 0 : l.id)} aria-expanded={open === l.id}>{__( 'Data', 'quicksheet' )}</Button>
												{l.status !== 'success' && <Button size="sm" variant="primary" icon="retry" loading={busy === l.id} onClick={() => retry(l)}>{__( 'Retry', 'quicksheet' )}</Button>}
												<Button size="sm" variant="ghost-danger" icon="trash" onClick={() => remove(l)} aria-label={__( 'Delete log', 'quicksheet' )} />
											</td>
										</tr>
										{open === l.id && (
											<tr className="qs-logtable__detail">
												<td colSpan={6}>
													<PayloadView data={l.row_data} />
												</td>
											</tr>
										)}
									</Fragment>
								))}
							</tbody>
						</table>
					</div>
				)}
			</Card>

			{data && data.pages > 1 && (
				<div className="qs-pager">
					<Button size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>{__( 'Previous', 'quicksheet' )}</Button>
					<span>{/* translators: 1: current page, 2: total pages, 3: total entries */ sprintf( __( 'Page %1$d of %2$d · %3$d entries', 'quicksheet' ), page, data.pages, data.total )}</span>
					<Button size="sm" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>{__( 'Next', 'quicksheet' )}</Button>
				</div>
			)}

			{confirmClear && (
				<Confirm
					title={__( 'Clear logs?', 'quicksheet' )}
					confirmLabel={status ? __( 'Clear filtered logs', 'quicksheet' ) : __( 'Clear all logs', 'quicksheet' )}
					onCancel={() => setConfirmClear(false)}
					onConfirm={async () => {
						try {
							await api.clearLogs(status);
							setPage(1);
							reload();
							toast(__( 'Logs cleared', 'quicksheet' ));
						} catch (e) {
							toast(errMsg(e), 'error');
						} finally {
							setConfirmClear(false);
						}
					}}
				>
					<p>{status ? /* translators: %s: log status filter, e.g. Failed */ sprintf( __( 'All "%s" log entries will be removed. Failed rows that were never sent can\'t be retried after this.', 'quicksheet' ), FILTERS.find((f) => f[0] === status)[1] ) : __( "All log entries will be removed. Failed rows that were never sent can't be retried after this.", 'quicksheet' )}</p>
				</Confirm>
			)}
		</div>
	);
}
