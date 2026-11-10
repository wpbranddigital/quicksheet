import { __, sprintf } from '@wordpress/i18n';
import { api } from '../api';
import { Card, Icon, Spinner, Notice, StatusPill, SourceLogo, LinkButton, Pill, timeAgo, useAsync } from '../components/ui';

const Stat = ({ label, value, tone, icon }) => (
	<div className={`qs-stat qs-stat--${tone}`}>
		<span className="qs-stat__icon"><Icon name={icon} size={18} /></span>
		<div>
			<div className="qs-stat__value">{value}</div>
			<div className="qs-stat__label">{label}</div>
		</div>
	</div>
);

const Chart = ({ series }) => {
	const max = Math.max(1, ...series.map((d) => d.success + d.failed));
	return (
		<div className="qs-chart" role="img" aria-label={__( 'Deliveries per day over the last 14 days', 'quicksheet' )}>
			{series.map((d) => {
				const total = d.success + d.failed;
				const label = new Date(d.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
				return (
					<div className="qs-chart__col" key={d.date} title={/* translators: 1: date, 2: number sent, 3: number failed */ sprintf( __( '%1$s: %2$d sent, %3$d failed', 'quicksheet' ), label, d.success, d.failed )}>
						<div className="qs-chart__bar" style={{ height: `${(total / max) * 100}%` }}>
							{d.failed > 0 && <span className="qs-chart__fail" style={{ height: `${(d.failed / total) * 100}%` }} />}
						</div>
						<span className="qs-chart__x">{label.split(' ')[1] || label}</span>
					</div>
				);
			})}
		</div>
	);
};

const Checklist = ({ data }) => {
	const anySource = data.sources.some((s) => s.active);
	const steps = [
		{ done: data.apps.some((a) => a.connected), title: __( 'Connect an app', 'quicksheet' ), desc: __( 'Google Sheets, WhatsApp, Discord or a Facebook Page.', 'quicksheet' ), href: '#/apps', cta: __( 'Open apps', 'quicksheet' ) },
		{ done: anySource, title: __( 'Activate a form plugin', 'quicksheet' ), desc: __( 'Contact Form 7, WPForms or Elementor Pro.', 'quicksheet' ), href: `${window.QSWP.adminUrl}plugin-install.php?s=contact+form+7&tab=search&type=term`, cta: __( 'Install', 'quicksheet' ) },
		{ done: data.feeds > 0, title: __( 'Create your first integration', 'quicksheet' ), desc: __( 'Pick a form, an app, and map the fields.', 'quicksheet' ), href: '#/integrations/new', cta: __( 'Create', 'quicksheet' ) },
	];
	if (steps.every((s) => s.done)) return null;
	const doneCount = steps.filter((s) => s.done).length;
	return (
		<Card title={__( 'Get started', 'quicksheet' )} subtitle={/* translators: %d: number of completed steps */ sprintf( __( '%d of 3 steps complete', 'quicksheet' ), doneCount )} className="qs-onboard">
			<ol className="qs-checklist">
				{steps.map((s, i) => (
					<li key={i} className={s.done ? 'is-done' : ''}>
						<span className="qs-checklist__dot">{s.done ? <Icon name="check" size={14} /> : i + 1}</span>
						<div className="qs-checklist__text">
							<strong>{s.title}</strong>
							<span>{s.desc}</span>
						</div>
						{!s.done && <LinkButton href={s.href} size="sm">{s.cta}</LinkButton>}
					</li>
				))}
			</ol>
		</Card>
	);
};

export default function Dashboard() {
	const [{ loading, data, error }] = useAsync(() => api.dashboard());

	if (loading) return <Spinner label={__( 'Loading dashboard…', 'quicksheet' )} />;
	if (error) return <Notice tone="error">{error.message}</Notice>;

	const { stats } = data;
	const total30 = stats.success + stats.failed + stats.pending;
	const rate = total30 ? Math.round((stats.success / total30) * 100) : 100;
	const notice = window.QSWP.notice;

	return (
		<div className="qs-page">
			{notice.connected && <Notice tone="success">{__( 'Google account connected successfully.', 'quicksheet' )}</Notice>}
			{data.google.last_error && <Notice tone="error">{data.google.last_error} <a href="#/apps">{__( 'Reconnect', 'quicksheet' )}</a></Notice>}
			{stats.failed > 0 && (
				<Notice tone="warning">
					{/* translators: %d: number of failed submissions */ sprintf( __( '%d submission(s) could not be delivered.', 'quicksheet' ), stats.failed )} <a href="#/logs">{__( 'Review and retry', 'quicksheet' )}</a>
				</Notice>
			)}

			<div className="qs-pagehead">
				<div>
					<h1>{__( 'Dashboard', 'quicksheet' )}</h1>
					<p>{__( 'Every form submission, delivered to your sheets, chats and pages.', 'quicksheet' )}</p>
				</div>
			</div>

			<Checklist data={data} />

			<div className="qs-stats">
				<Stat icon="link" tone="brand" label={__( 'Active integrations', 'quicksheet' )} value={`${data.active_feeds}/${data.feeds}`} />
				<Stat icon="check" tone="success" label={__( 'Delivered today', 'quicksheet' )} value={stats.today} />
				<Stat icon="sheet" tone="info" label={__( 'Success rate (30 days)', 'quicksheet' )} value={`${rate}%`} />
				<Stat icon="alert" tone={stats.failed ? 'danger' : 'muted'} label={__( 'Failed (30 days)', 'quicksheet' )} value={stats.failed + stats.pending} />
			</div>

			<div className="qs-grid-2">
				<Card title={__( 'Last 14 days', 'quicksheet' )} subtitle={__( 'Deliveries across all apps', 'quicksheet' )}>
					<Chart series={stats.series} />
					<div className="qs-legend">
						<span><i className="qs-legend__ok" /> {__( 'Sent', 'quicksheet' )}</span>
						<span><i className="qs-legend__bad" /> {__( 'Failed', 'quicksheet' )}</span>
					</div>
				</Card>

				<Card title={__( 'Triggers & apps', 'quicksheet' )} subtitle={__( "What's connected on this site", 'quicksheet' )}>
					<ul className="qs-sources">
						{data.sources.map((s) => (
							<li key={s.slug}>
								<SourceLogo source={s.slug} />
								<span className="qs-sources__name">{s.label}</span>
								{s.active ? <Pill tone="success">{__( 'Active', 'quicksheet' )}</Pill> : s.install_url ? <a href={s.install_url}>{__( 'Install', 'quicksheet' )}</a> : <Pill>{__( 'Not installed', 'quicksheet' )}</Pill>}
							</li>
						))}
					</ul>
					<ul className="qs-sources qs-sources--apps">
						{data.apps.map((a) => (
							<li key={a.slug}>
								<SourceLogo source={a.slug} />
								<span className="qs-sources__name">{a.label}</span>
								{a.connected ? <Pill tone="success">{__( 'Connected', 'quicksheet' )}</Pill> : <a href="#/apps">{__( 'Connect', 'quicksheet' )}</a>}
								{a.connected && <span className="qs-sources__count">{/* translators: %d: number of delivered submissions */ sprintf( __( '%d sent', 'quicksheet' ), (stats.by_action && stats.by_action[a.slug]) || 0 )}</span>}
							</li>
						))}
					</ul>
				</Card>
			</div>

			<Card title={__( 'Recent activity', 'quicksheet' )} actions={<a href="#/logs" className="qs-link">{__( 'View all logs', 'quicksheet' )} <Icon name="arrow" size={14} /></a>}>
				{data.recent.length === 0 ? (
					<p className="qs-muted">{__( 'No submissions yet. Once a form with an active integration is submitted, it shows up here.', 'quicksheet' )}</p>
				) : (
					<ul className="qs-activity">
						{data.recent.map((l) => (
							<li key={l.id}>
								<StatusPill status={l.status} />
								<SourceLogo source={l.action || 'google_sheets'} size={22} />
								<span className="qs-activity__name">{l.feed_name || /* translators: %d: integration ID */ sprintf( __( 'Integration #%d', 'quicksheet' ), l.feed_id )}</span>
								<span className="qs-activity__msg">{l.message}</span>
								<time>{timeAgo(l.created_at)}</time>
							</li>
						))}
					</ul>
				)}
			</Card>
		</div>
	);
}
