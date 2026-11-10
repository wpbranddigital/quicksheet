import { __, sprintf } from '@wordpress/i18n';
import { api, errMsg } from '../api';
import { navigate } from '../router';
import { Button, Card, Field, Icon, Notice, SourceLogo, Spinner, Toggle, colLetter, useToast } from '../components/ui';
import SpreadsheetPicker from '../components/SpreadsheetPicker';
import AccountModal from '../components/AccountModal';
import TagInput, { SMART_TAGS, TagSelect } from '../components/TagInput';

const { useState, useEffect, useMemo, useCallback } = wp.element;

const DEFAULT_SETTINGS = {
	google_sheets: {},
	discord: { message: '**New submission: {form_title}**\n{all_fields}', username: '', use_embed: false, embed_title: 'New {form_title} submission', embed_color: '#12855a' },
	whatsapp: { recipient: '', message_type: 'text', message: 'New submission from {form_title}\n\n{all_fields}', template_name: '', template_language: 'en_US', template_params: [] },
	facebook_page: { message: '', link: '' },
};
const EMPTY_CONDITION = { enabled: false, match: 'all', rules: [] };

const EMPTY = {
	name: '',
	source: '',
	form_id: '',
	form_title: '',
	action: '',
	account_id: 0,
	spreadsheet_id: '',
	spreadsheet_name: '',
	sheet_name: '',
	field_map: [],
	settings: { condition: EMPTY_CONDITION },
	status: true,
};

const OPERATORS = [
	['equals', __( 'is', 'quicksheet' )],
	['not_equals', __( 'is not', 'quicksheet' )],
	['contains', __( 'contains', 'quicksheet' )],
	['not_contains', __( 'does not contain', 'quicksheet' )],
	['starts_with', __( 'starts with', 'quicksheet' )],
	['empty', __( 'is empty', 'quicksheet' )],
	['not_empty', __( 'is not empty', 'quicksheet' )],
	['greater_than', __( 'greater than', 'quicksheet' )],
	['less_than', __( 'less than', 'quicksheet' )],
];

const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

/* ------------------------------------------------------------ value picker (sheets) */
const ValuePicker = ({ value, fields, onChange }) => {
	const options = useMemo(() => [...fields.map((f) => `{field:${f.key}}`), ...SMART_TAGS.map((t) => t[0])], [fields]);
	// Custom mode is derived, so it stays correct when form fields finish loading after the map.
	const [forceCustom, setCustom] = useState(false);
	const custom = forceCustom || (value !== '' && !options.includes(value));

	return (
		<div className="qs-valuepicker">
			<select
				className="qs-select"
				value={custom ? '__custom' : value}
				onChange={(e) => {
					const v = e.target.value;
					if (v === '__custom') { setCustom(true); } else { setCustom(false); onChange(v); }
				}}
			>
				<option value="">{__( '— Leave empty —', 'quicksheet' )}</option>
				{fields.length > 0 && (
					<optgroup label={__( 'Form fields', 'quicksheet' )}>
						{fields.map((f) => <option key={f.key} value={`{field:${f.key}}`}>{f.label}{f.label !== f.key ? ` (${f.key})` : ''}</option>)}
					</optgroup>
				)}
				<optgroup label={__( 'Smart tags', 'quicksheet' )}>
					{SMART_TAGS.map(([tag, label]) => <option key={tag} value={tag}>{label}</option>)}
				</optgroup>
				<option value="__custom">{__( 'Custom value / combine…', 'quicksheet' )}</option>
			</select>
			{custom && (
				<input type="text" className="qs-input qs-input--mono" value={value} placeholder="e.g. {field:first-name} {field:last-name}" onChange={(e) => onChange(e.target.value)} />
			)}
		</div>
	);
};

/* ------------------------------------------------------------ Google Sheets config */
const SheetsConfig = ({ feed, set, fields, google, map, setMap }) => {
	const toast = useToast();
	const [tabs, setTabs] = useState({ loading: false, items: [], error: null });
	const [headers, setHeaders] = useState({ loading: false, items: [], error: null });
	const [extraCols, setExtraCols] = useState(0);
	const [writing, setWriting] = useState(false);

	useEffect(() => {
		if (!feed.spreadsheet_id || !google.connected) { setTabs({ loading: false, items: [], error: null }); return; }
		setTabs({ loading: true, items: [], error: null });
		api.spreadsheet(feed.spreadsheet_id)
			.then((res) => {
				setTabs({ loading: false, items: res.sheets, error: null });
				set((f) => ({
					spreadsheet_name: f.spreadsheet_name || res.title,
					sheet_name: f.sheet_name && res.sheets.some((s) => s.title === f.sheet_name) ? f.sheet_name : (res.sheets[0] ? res.sheets[0].title : ''),
				}));
			})
			.catch((e) => setTabs({ loading: false, items: [], error: errMsg(e) }));
	}, [feed.spreadsheet_id, google.connected, set]);

	const loadHeaders = () => {
		if (!feed.spreadsheet_id || !feed.sheet_name) { setHeaders({ loading: false, items: [], error: null }); return; }
		setHeaders((h) => ({ ...h, loading: true, error: null }));
		api.headers(feed.spreadsheet_id, feed.sheet_name)
			.then((items) => setHeaders({ loading: false, items, error: null }))
			.catch((e) => setHeaders({ loading: false, items: [], error: errMsg(e) }));
	};
	useEffect(loadHeaders, [feed.spreadsheet_id, feed.sheet_name]);

	const columnCount = useMemo(() => {
		const mapped = Object.keys(map).map(Number);
		const maxMapped = mapped.length ? Math.max(...mapped) + 1 : 0;
		return Math.max(headers.items.length, maxMapped, headers.items.length ? 0 : 1) + extraCols;
	}, [headers.items, map, extraCols]);

	const autoMap = () => {
		const next = { ...map };
		let hits = 0;
		headers.items.forEach((h, i) => {
			if (next[i]) return;
			const n = norm(h);
			if (!n) return;
			const f = fields.find((x) => norm(x.label) === n || norm(x.key) === n || norm(x.key).replace(/^your/, '') === n);
			if (f) { next[i] = `{field:${f.key}}`; hits++; return; }
			const tag = SMART_TAGS.find(([t, l]) => norm(l) === n || norm(t) === n);
			if (tag) { next[i] = tag[0]; hits++; return; }
			if (['date', 'timestamp', 'submittedat', 'submitted', 'datetime', 'time'].includes(n)) { next[i] = '{datetime}'; hits++; }
		});
		setMap(next);
		toast(hits ? /* translators: %d: number of matched columns */ sprintf( __( 'Matched %d column(s)', 'quicksheet' ), hits ) : __( 'No matching column names found', 'quicksheet' ), hits ? 'success' : 'error');
	};

	const createHeaderRow = async () => {
		const hdrs = [...fields.map((f) => f.label), __( 'Submitted At', 'quicksheet' )];
		setWriting(true);
		try {
			await api.setHeaders(feed.spreadsheet_id, feed.sheet_name, hdrs);
			const m = {};
			fields.forEach((f, i) => { m[i] = `{field:${f.key}}`; });
			m[fields.length] = '{datetime}';
			setMap(m);
			setExtraCols(0);
			setHeaders({ loading: false, items: hdrs, error: null });
			toast(__( 'Header row created and fields mapped', 'quicksheet' ));
		} catch (e) {
			toast(errMsg(e), 'error');
		} finally {
			setWriting(false);
		}
	};

	if (!google.connected) {
		return <Notice tone="warning">{__( "Google isn't connected yet.", 'quicksheet' )} <a href="#/apps">{__( 'Connect Google Sheets in Apps', 'quicksheet' )}</a> {__( 'first.', 'quicksheet' )}</Notice>;
	}

	const ready = feed.spreadsheet_id && feed.sheet_name && !tabs.error;
	const mapped = Object.values(map).filter((v) => v && v.trim()).length;

	return (
		<>
			<div className="qs-row-2">
				<Field label={__( 'Spreadsheet', 'quicksheet' )}>
					<SpreadsheetPicker
						value={{ id: feed.spreadsheet_id, name: feed.spreadsheet_name }}
						onChange={(s) => { set({ spreadsheet_id: s.id, spreadsheet_name: s.name, sheet_name: '' }); setMap({}); setExtraCols(0); }}
					/>
				</Field>
				<Field label={__( 'Sheet tab', 'quicksheet' )} htmlFor="qs-tab">
					{tabs.loading ? <Spinner /> : (
						<select id="qs-tab" className="qs-select" value={feed.sheet_name} disabled={!tabs.items.length} onChange={(e) => { set({ sheet_name: e.target.value }); setMap({}); setExtraCols(0); }}>
							{!tabs.items.length && <option value="">—</option>}
							{tabs.items.map((t) => <option key={t.id} value={t.title}>{t.title}</option>)}
						</select>
					)}
				</Field>
			</div>
			{tabs.error && <Notice tone="error">{tabs.error}</Notice>}

			{ready && feed.form_id && (
				<div className="qs-subsection">
					<div className="qs-subsection__head">
						<strong>{__( 'Field mapping', 'quicksheet' )}</strong>
						<div className="qs-inline">
							<a className="qs-link" href={`https://docs.google.com/spreadsheets/d/${feed.spreadsheet_id}/edit`} target="_blank" rel="noopener noreferrer">{__( 'Open sheet', 'quicksheet' )} <Icon name="external" size={12} /></a>
							<Button size="sm" icon="refresh" onClick={loadHeaders} loading={headers.loading}>{__( 'Reload headers', 'quicksheet' )}</Button>
							{headers.items.length > 0 && fields.length > 0 && <Button size="sm" icon="wand" onClick={autoMap}>{__( 'Auto-map', 'quicksheet' )}</Button>}
						</div>
					</div>
					{headers.loading ? <Spinner label={__( 'Reading sheet headers…', 'quicksheet' )} /> : (
						<>
							{headers.error && <Notice tone="error">{headers.error}</Notice>}
							{headers.items.length === 0 && (
								<div className="qs-callout">
									<div>
										<strong>{__( 'This tab has no header row.', 'quicksheet' )}</strong>
										<p>{__( 'Create one from your form fields and everything gets mapped automatically — or map columns manually below.', 'quicksheet' )}</p>
									</div>
									<Button variant="primary" icon="wand" loading={writing} disabled={!fields.length} onClick={createHeaderRow}>{__( 'Create header row', 'quicksheet' )}</Button>
								</div>
							)}
							<div className="qs-table-wrap">
								<table className="qs-table qs-maptable">
									<thead>
										<tr><th style={{ width: 56 }}>{__( 'Col', 'quicksheet' )}</th><th>{__( 'Sheet column', 'quicksheet' )}</th><th aria-hidden="true" style={{ width: 28 }} /><th>{__( 'Value', 'quicksheet' )}</th></tr>
									</thead>
									<tbody>
										{Array.from({ length: columnCount }).map((_, i) => (
											<tr key={i} className={map[i] ? 'is-mapped' : ''}>
												<td><span className="qs-col">{colLetter(i)}</span></td>
												<td>{headers.items[i] ? <strong>{headers.items[i]}</strong> : <span className="qs-muted">{/* translators: %s: spreadsheet column letter, e.g. A */ sprintf( __( 'Column %s', 'quicksheet' ), colLetter(i) )}</span>}</td>
												<td className="qs-maptable__arrow"><Icon name="arrow" size={14} /></td>
												<td><ValuePicker value={map[i] || ''} fields={fields} onChange={(v) => setMap((m) => ({ ...m, [i]: v }))} /></td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
							<div className="qs-maptable__foot">
								<Button size="sm" icon="plus" onClick={() => setExtraCols((n) => n + 1)}>{__( 'Add column', 'quicksheet' )}</Button>
								<span className="qs-muted">{/* translators: %d: number of mapped columns */ sprintf( __( '%d column(s) mapped', 'quicksheet' ), mapped )}</span>
							</div>
						</>
					)}
				</div>
			)}
		</>
	);
};

/* ------------------------------------------------------------ message apps */
const DiscordConfig = ({ s, setS, fields }) => (
	<>
		<Field label={__( 'Message', 'quicksheet' )} htmlFor="qs-dc-msg" help={__( 'Markdown is supported. Max 2,000 characters (4,096 inside an embed). @mentions are disabled for safety.', 'quicksheet' )}>
			<TagInput id="qs-dc-msg" multiline value={s.message} onChange={(v) => setS({ message: v })} fields={fields} />
		</Field>
		<div className="qs-row-2">
			<Field label={__( 'Bot name (optional)', 'quicksheet' )} htmlFor="qs-dc-user" help={__( "Overrides the webhook's default name.", 'quicksheet' )}>
				<input id="qs-dc-user" className="qs-input" value={s.username} onChange={(e) => setS({ username: e.target.value })} placeholder="Website bot" />
			</Field>
			<Field label={__( 'Format', 'quicksheet' )}>
				<Toggle checked={s.use_embed} onChange={(v) => setS({ use_embed: v })} label={__( 'Send as rich embed card', 'quicksheet' )} />
			</Field>
		</div>
		{s.use_embed && (
			<div className="qs-row-2">
				<Field label={__( 'Embed title', 'quicksheet' )} htmlFor="qs-dc-title">
					<TagInput id="qs-dc-title" value={s.embed_title} onChange={(v) => setS({ embed_title: v })} fields={fields} />
				</Field>
				<Field label={__( 'Accent color', 'quicksheet' )} htmlFor="qs-dc-color">
					<input id="qs-dc-color" type="color" className="qs-color" value={s.embed_color} onChange={(e) => setS({ embed_color: e.target.value })} />
				</Field>
			</div>
		)}
	</>
);

const WhatsappConfig = ({ s, setS, fields }) => {
	const phoneFields = fields.filter((f) => /tel|phone/i.test(f.type + f.key + f.label));
	return (
		<>
			<Field label={__( 'Send to', 'quicksheet' )} htmlFor="qs-wa-to" help={__( 'Your own number for lead alerts, or a phone field to message the person who submitted. Use international format, e.g. +8801712345678.', 'quicksheet' )}>
				<div className="qs-taginput">
					<input id="qs-wa-to" className="qs-input" value={s.recipient} onChange={(e) => setS({ recipient: e.target.value })} placeholder="+8801712345678 or {field:phone}" />
					<TagSelect fields={phoneFields.length ? phoneFields : fields} onPick={(t) => setS({ recipient: t })} label={__( 'Use a form field', 'quicksheet' )} smart={false} />
				</div>
			</Field>
			<Field label={__( 'Message type', 'quicksheet' )}>
				<div className="qs-segment" role="radiogroup">
					{[['text', __( 'Text message', 'quicksheet' )], ['template', __( 'Approved template', 'quicksheet' )]].map(([k, l]) => (
						<button key={k} type="button" role="radio" aria-checked={s.message_type === k} className={s.message_type === k ? 'is-active' : ''} onClick={() => setS({ message_type: k })}>{l}</button>
					))}
				</div>
			</Field>
			{s.message_type === 'text' ? (
				<>
					<Notice tone="info">{__( 'WhatsApp only delivers free-form text if the recipient messaged your business number in the last 24 hours. To message new leads first, use an approved template.', 'quicksheet' )}</Notice>
					<Field label={__( 'Message', 'quicksheet' )} htmlFor="qs-wa-msg">
						<TagInput id="qs-wa-msg" multiline value={s.message} onChange={(v) => setS({ message: v })} fields={fields} />
					</Field>
				</>
			) : (
				<>
					<div className="qs-row-2">
						<Field label={__( 'Template name', 'quicksheet' )} htmlFor="qs-wa-tpl" help={__( 'Exactly as approved in WhatsApp Manager.', 'quicksheet' )}>
							<input id="qs-wa-tpl" className="qs-input qs-input--mono" value={s.template_name} onChange={(e) => setS({ template_name: e.target.value })} placeholder="new_lead_alert" />
						</Field>
						<Field label={__( 'Language code', 'quicksheet' )} htmlFor="qs-wa-lang">
							<input id="qs-wa-lang" className="qs-input qs-input--mono" value={s.template_language} onChange={(e) => setS({ template_language: e.target.value })} placeholder="en_US" />
						</Field>
					</div>
					<Field label={__( 'Body variables', 'quicksheet' )} help={__( 'Values for {{1}}, {{2}} … in your template body, in order.', 'quicksheet' )}>
						<div className="qs-params">
							{s.template_params.map((p, i) => (
								<div key={i} className="qs-params__row">
									<span className="qs-col">{`{{${i + 1}}}`}</span>
									<TagInput value={p} fields={fields} onChange={(v) => setS({ template_params: s.template_params.map((x, j) => (j === i ? v : x)) })} />
									<Button size="sm" variant="ghost-danger" icon="x" aria-label={__( 'Remove variable', 'quicksheet' )} onClick={() => setS({ template_params: s.template_params.filter((_, j) => j !== i) })} />
								</div>
							))}
							<Button size="sm" icon="plus" onClick={() => setS({ template_params: [...s.template_params, ''] })}>{__( 'Add variable', 'quicksheet' )}</Button>
						</div>
					</Field>
				</>
			)}
		</>
	);
};

const FacebookConfig = ({ s, setS, fields }) => (
	<>
		<Notice tone="info">{__( 'Posts are public on your Page. Avoid posting personal data such as emails or phone numbers from submissions.', 'quicksheet' )}</Notice>
		<Field label={__( 'Post text', 'quicksheet' )} htmlFor="qs-fb-msg">
			<TagInput id="qs-fb-msg" multiline value={s.message} onChange={(v) => setS({ message: v })} fields={fields} placeholder="🎉 Thanks {field:your-name} for joining our community!" />
		</Field>
		<Field label={__( 'Link (optional)', 'quicksheet' )} htmlFor="qs-fb-link" help={__( 'Adds a link preview to the post.', 'quicksheet' )}>
			<TagInput id="qs-fb-link" value={s.link} onChange={(v) => setS({ link: v })} fields={fields} placeholder="https://example.com/offer" />
		</Field>
	</>
);

/* ------------------------------------------------------------ conditions */
const ConditionsCard = ({ condition, setCondition, fields, step }) => {
	const c = condition || EMPTY_CONDITION;
	const update = (patch) => setCondition({ ...c, ...patch });
	const rules = c.rules.length ? c.rules : [{ field: fields[0] ? `{field:${fields[0].key}}` : '', operator: 'equals', value: '' }];
	const setRule = (i, patch) => update({ rules: rules.map((r, j) => (j === i ? { ...r, ...patch } : r)) });

	return (
		<Card step={step} title={__( 'Conditions', 'quicksheet' )} subtitle={__( 'Optional — only run this integration when the submission matches.', 'quicksheet' )} actions={<Toggle checked={c.enabled} onChange={(v) => update({ enabled: v, rules })} label={c.enabled ? __( 'On', 'quicksheet' ) : __( 'Off', 'quicksheet' )} />}>
			{!c.enabled ? <p className="qs-muted">{__( 'Runs for every submission.', 'quicksheet' )}</p> : (
				<>
					<div className="qs-inline">
						<span>{__( 'Run when', 'quicksheet' )}</span>
						<select className="qs-select qs-select--sm qs-select--auto" value={c.match} onChange={(e) => update({ match: e.target.value })}>
							<option value="all">{__( 'all', 'quicksheet' )}</option>
							<option value="any">{__( 'any', 'quicksheet' )}</option>
						</select>
						<span>{__( 'of these rules match:', 'quicksheet' )}</span>
					</div>
					<div className="qs-rules">
						{rules.map((r, i) => (
							<div className="qs-rule" key={i}>
								<select className="qs-select" value={r.field} onChange={(e) => setRule(i, { field: e.target.value })} aria-label={__( 'Field', 'quicksheet' )}>
									{fields.map((f) => <option key={f.key} value={`{field:${f.key}}`}>{f.label}</option>)}
									<option value="{page_url}">{__( 'Page URL', 'quicksheet' )}</option>
									<option value="{user_email}">{__( 'Logged-in user email', 'quicksheet' )}</option>
								</select>
								<select className="qs-select" value={r.operator} onChange={(e) => setRule(i, { operator: e.target.value })} aria-label={__( 'Operator', 'quicksheet' )}>
									{OPERATORS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
								</select>
								{!['empty', 'not_empty'].includes(r.operator) ? (
									<input className="qs-input" value={r.value} onChange={(e) => setRule(i, { value: e.target.value })} placeholder={__( 'Value', 'quicksheet' )} aria-label={__( 'Value', 'quicksheet' )} />
								) : <span />}
								<Button size="sm" variant="ghost-danger" icon="x" aria-label={__( 'Remove rule', 'quicksheet' )} disabled={rules.length < 2} onClick={() => update({ rules: rules.filter((_, j) => j !== i) })} />
							</div>
						))}
					</div>
					<div><Button size="sm" icon="plus" onClick={() => update({ rules: [...rules, { field: rules[0].field, operator: 'equals', value: '' }] })}>{__( 'Add rule', 'quicksheet' )}</Button></div>
				</>
			)}
		</Card>
	);
};

/* ------------------------------------------------------------ main */
export default function Editor({ id }) {
	const toast = useToast();
	const [feed, setFeed] = useState(EMPTY);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [google, setGoogle] = useState({ connected: false });
	const [sources, setSources] = useState([]);
	const [apps, setApps] = useState([]);
	const [forms, setForms] = useState({ loading: false, items: [] });
	const [fields, setFields] = useState({ loading: false, items: [] });
	const [map, setMap] = useState({});
	const [saving, setSaving] = useState(false);
	const [testing, setTesting] = useState(false);
	const [accountModal, setAccountModal] = useState(null);
	const [appSearch, setAppSearch] = useState('');

	const set = useCallback((patch) => setFeed((f) => ({ ...f, ...(typeof patch === 'function' ? patch(f) : patch) })), []);
	const setS = (patch) => setFeed((f) => ({ ...f, settings: { ...f.settings, ...patch } }));

	useEffect(() => {
		Promise.all([api.sources(), api.actions(), api.status(), id ? api.feed(id) : Promise.resolve(null)])
			.then(([src, acts, st, existing]) => {
				setSources(src);
				setApps(acts);
				setGoogle(st);
				if (existing) {
					setFeed({ ...EMPTY, ...existing, settings: { ...DEFAULT_SETTINGS[existing.action], condition: EMPTY_CONDITION, ...existing.settings } });
					const m = {};
					existing.field_map.forEach((r) => { m[r.col] = r.value; });
					setMap(m);
				} else {
					const firstActive = src.find((s) => s.active);
					if (firstActive) set({ source: firstActive.slug });
				}
			})
			.catch(setError)
			.finally(() => setLoading(false));
	}, [id, set]);

	useEffect(() => {
		if (!feed.source) return;
		const src = sources.find((s) => s.slug === feed.source);
		if (src && !src.active) { setForms({ loading: false, items: [] }); return; }
		setForms({ loading: true, items: [] });
		api.forms(feed.source)
			.then((items) => setForms({ loading: false, items }))
			.catch((e) => { setForms({ loading: false, items: [] }); toast(errMsg(e), 'error'); });
	}, [feed.source, sources, toast]);

	useEffect(() => {
		if (!feed.source || !feed.form_id) { setFields({ loading: false, items: [] }); return; }
		setFields({ loading: true, items: [] });
		api.fields(feed.source, feed.form_id)
			.then((items) => setFields({ loading: false, items }))
			.catch(() => setFields({ loading: false, items: [] }));
	}, [feed.source, feed.form_id]);

	const app = apps.find((a) => a.slug === feed.action);

	const chooseAction = (slug) => {
		if (slug === feed.action) return;
		const a = apps.find((x) => x.slug === slug);
		set({
			action: slug,
			account_id: a && a.accounts.length ? a.accounts[0].id : 0,
			settings: { ...DEFAULT_SETTINGS[slug], condition: feed.settings.condition || EMPTY_CONDITION },
		});
	};

	const onAccountSaved = (account) => {
		setApps((list) => list.map((a) => (a.slug === account.service ? { ...a, connected: true, accounts: [account, ...a.accounts] } : a)));
		set({ account_id: account.id });
		setAccountModal(null);
		toast(sprintf( __( '%s connected', 'quicksheet' ), account.name ));
	};

	const save = async ({ andTest = false } = {}) => {
		const field_map = Object.entries(map)
			.filter(([, v]) => v && v.trim() !== '')
			.map(([col, value]) => ({ col: Number(col), value }));
		let recipient = '';
		if (andTest && feed.action === 'whatsapp' && /\{field:/.test(feed.settings.recipient || '')) {
			// eslint-disable-next-line no-alert
			recipient = window.prompt(__( 'Send the test WhatsApp message to which number? (international format)', 'quicksheet' ), '') || '';
			if (!recipient) return;
		}
		setSaving(true);
		try {
			const saved = await api.saveFeed({ ...feed, field_map }, id);
			toast(id ? __( 'Integration saved', 'quicksheet' ) : __( 'Integration created', 'quicksheet' ));
			if (andTest) {
				setTesting(true);
				try {
					const res = await api.testFeed(saved.id, recipient ? { recipient } : {});
					toast(res.message || __( 'Test sent', 'quicksheet' ));
				} catch (e) {
					toast(errMsg(e), 'error');
				} finally {
					setTesting(false);
				}
			}
			if (!id) navigate(`/integrations/${saved.id}`);
		} catch (e) {
			toast(errMsg(e), 'error');
		} finally {
			setSaving(false);
		}
	};

	if (loading) return <Spinner label={__( 'Loading…', 'quicksheet' )} />;
	if (error) return <Notice tone="error">{errMsg(error)}</Notice>;

	const currentSource = sources.find((s) => s.slug === feed.source);
	const filteredApps = apps.filter((a) => !appSearch || a.label.toLowerCase().includes(appSearch.toLowerCase()));
	const usesAccounts = app && app.uses_accounts;
	const canSave = feed.form_id && feed.action && (feed.action !== 'google_sheets' || Object.values(map).some((v) => v && v.trim()));

	return (
		<div className="qs-page qs-editor">
			<div className="qs-pagehead">
				<div>
					<a href="#/integrations" className="qs-back">{__( '← Integrations', 'quicksheet' )}</a>
					<h1>{id ? __( 'Edit integration', 'quicksheet' ) : __( 'Create integration', 'quicksheet' )}</h1>
				</div>
				<div className="qs-pagehead__actions">
					<Toggle checked={feed.status} onChange={(v) => set({ status: v })} label={feed.status ? __( 'Active', 'quicksheet' ) : __( 'Paused', 'quicksheet' )} />
				</div>
			</div>

			<ol className="qs-stepbar" aria-label={__( 'Progress', 'quicksheet' )}>
				{[[__( 'Trigger', 'quicksheet' ), !!feed.form_id], [__( 'Action', 'quicksheet' ), !!feed.action], [__( 'Configure', 'quicksheet' ), !!canSave]].map(([l, done], i) => (
					<li key={l} className={done ? 'is-done' : ''}><span>{done ? <Icon name="check" size={12} /> : i + 1}</span>{l}</li>
				))}
			</ol>

			{/* 1 — Trigger */}
			<Card step="1" title={__( 'Trigger', 'quicksheet' )} subtitle={__( 'When this form is submitted…', 'quicksheet' )}>
				<div className="qs-tiles">
					{sources.map((s) => (
						<button type="button" key={s.slug} className={`qs-tile ${feed.source === s.slug ? 'is-selected' : ''} ${s.active ? '' : 'is-disabled'}`} onClick={() => s.active && feed.source !== s.slug && set({ source: s.slug, form_id: '', form_title: '' })} aria-pressed={feed.source === s.slug} disabled={!s.active}>
							<SourceLogo source={s.slug} size={36} />
							<span className="qs-tile__label">{s.label}</span>
							<span className="qs-tile__meta">{s.active ? __( 'Active', 'quicksheet' ) : __( 'Not active', 'quicksheet' )}</span>
						</button>
					))}
				</div>
				{currentSource && currentSource.active && (
					<Field label={__( 'Form', 'quicksheet' )} htmlFor="qs-form">
						{forms.loading ? <Spinner /> : forms.items.length === 0 ? (
							<p className="qs-muted">{/* translators: %s: form plugin name */ sprintf( __( 'No forms found in %s. Create a form first, then come back.', 'quicksheet' ), currentSource.label )}</p>
						) : (
							<select id="qs-form" className="qs-select" value={feed.form_id} onChange={(e) => { const f = forms.items.find((x) => x.id === e.target.value); set({ form_id: e.target.value, form_title: f ? f.title : '' }); setMap({}); }}>
								<option value="">{__( 'Select a form…', 'quicksheet' )}</option>
								{forms.items.map((f) => <option key={f.id} value={f.id}>{f.title}</option>)}
							</select>
						)}
					</Field>
				)}
				{feed.form_id && !fields.loading && <p className="qs-hint"><Icon name="form" size={14} /> {/* translators: %d: number of form fields */ sprintf( __( '%d field(s) detected', 'quicksheet' ), fields.items.length )}</p>}
			</Card>

			{/* 2 — Action */}
			<Card step="2" title={__( 'Action', 'quicksheet' )} subtitle={__( '…do this.', 'quicksheet' )} actions={<div className="qs-search"><Icon name="search" size={14} /><input className="qs-input qs-input--sm" placeholder={__( 'Search apps', 'quicksheet' )} value={appSearch} onChange={(e) => setAppSearch(e.target.value)} aria-label={__( 'Search apps', 'quicksheet' )} /></div>}>
				<div className="qs-appgrid">
					{filteredApps.map((a) => (
						<button type="button" key={a.slug} className={`qs-appcard ${feed.action === a.slug ? 'is-selected' : ''}`} onClick={() => chooseAction(a.slug)} aria-pressed={feed.action === a.slug}>
							<SourceLogo source={a.slug} size={40} />
							<span className="qs-appcard__label">{a.label}</span>
							<span className="qs-appcard__desc">{a.description}</span>
							{a.connected ? <span className="qs-appcard__badge">{__( 'Connected', 'quicksheet' )}</span> : <span className="qs-appcard__badge is-off">{__( 'Not connected', 'quicksheet' )}</span>}
						</button>
					))}
				</div>

				{usesAccounts && (
					<Field label={/* translators: %s: app name */ sprintf( __( '%s account', 'quicksheet' ), app.label )} htmlFor="qs-account">
						<div className="qs-inline qs-inline--nowrap">
							{app.accounts.length > 0 ? (
								<select id="qs-account" className="qs-select" value={feed.account_id} onChange={(e) => set({ account_id: Number(e.target.value) })}>
									<option value={0}>{__( 'Choose an account…', 'quicksheet' )}</option>
									{app.accounts.map((acc) => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
								</select>
							) : <span className="qs-muted">{/* translators: %s: app name */ sprintf( __( 'No %s account connected yet.', 'quicksheet' ), app.label )}</span>}
							<Button icon="plus" onClick={() => setAccountModal(app)}>{__( 'Add account', 'quicksheet' )}</Button>
						</div>
					</Field>
				)}
			</Card>

			{/* 3 — Configure */}
			{app && (
				<Card step="3" title={/* translators: %s: app name */ sprintf( __( 'Configure %s', 'quicksheet' ), app.label )} subtitle={feed.action === 'google_sheets' ? __( 'Pick a spreadsheet and map form fields to columns.', 'quicksheet' ) : __( 'Compose the message. Use “Insert field” to add submitted values.', 'quicksheet' )}>
					{!feed.form_id ? <p className="qs-muted">{__( 'Choose a trigger form first.', 'quicksheet' )}</p> : (
						<>
							{feed.action === 'google_sheets' && <SheetsConfig feed={feed} set={set} fields={fields.items} google={google} map={map} setMap={setMap} />}
							{feed.action === 'discord' && <DiscordConfig s={feed.settings} setS={setS} fields={fields.items} />}
							{feed.action === 'whatsapp' && <WhatsappConfig s={feed.settings} setS={setS} fields={fields.items} />}
							{feed.action === 'facebook_page' && <FacebookConfig s={feed.settings} setS={setS} fields={fields.items} />}
						</>
					)}
				</Card>
			)}

			{app && feed.form_id && <ConditionsCard step="4" condition={feed.settings.condition} setCondition={(c) => setS({ condition: c })} fields={fields.items} />}

			<Card>
				<div className="qs-savebar">
					<Field label={__( 'Integration name', 'quicksheet' )} htmlFor="qs-name" help={__( 'Optional — shown in the list and logs.', 'quicksheet' )}>
						<input id="qs-name" className="qs-input" value={feed.name} placeholder={feed.form_title && app ? `${feed.form_title} → ${app.label}` : 'e.g. Contact leads to WhatsApp'} onChange={(e) => set({ name: e.target.value })} />
					</Field>
					<div className="qs-savebar__actions">
						<Button onClick={() => navigate('/integrations')}>{__( 'Cancel', 'quicksheet' )}</Button>
						<Button icon="play" loading={testing} disabled={saving || !canSave} onClick={() => save({ andTest: true })}>{__( 'Save & send test', 'quicksheet' )}</Button>
						<Button variant="primary" icon="check" loading={saving && !testing} disabled={!canSave} onClick={() => save()}>{id ? __( 'Save changes', 'quicksheet' ) : __( 'Create integration', 'quicksheet' )}</Button>
					</div>
				</div>
			</Card>

			{accountModal && <AccountModal app={accountModal} onClose={() => setAccountModal(null)} onSaved={onAccountSaved} />}
		</div>
	);
}
