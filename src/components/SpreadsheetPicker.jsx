import { __ } from '@wordpress/i18n';
import { api, errMsg } from '../api';
import { Button, Icon } from './ui';

const { useState, useEffect, useRef } = wp.element;

const parseId = (v) => {
	const m = String(v).match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
	if (m) return m[1];
	return /^[a-zA-Z0-9-_]{20,}$/.test(v.trim()) ? v.trim() : '';
};

/**
 * Searchable spreadsheet chooser: browse Drive, paste a URL, or create a new sheet.
 */
export default function SpreadsheetPicker({ value, onChange, disabled }) {
	const [open, setOpen] = useState(false);
	const [mode, setMode] = useState('browse'); // browse | url | create
	const [search, setSearch] = useState('');
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [input, setInput] = useState('');
	const [busy, setBusy] = useState(false);
	const ref = useRef(null);

	useEffect(() => {
		if (!open) return;
		const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
		const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
		document.addEventListener('mousedown', onDoc);
		document.addEventListener('keydown', onKey);
		return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
	}, [open]);

	useEffect(() => {
		if (!open || mode !== 'browse') return;
		setLoading(true);
		setError('');
		const t = setTimeout(() => {
			api.spreadsheets(search)
				.then(setItems)
				.catch((e) => setError(errMsg(e)))
				.finally(() => setLoading(false));
		}, search ? 300 : 0);
		return () => clearTimeout(t);
	}, [open, search, mode]);

	const pick = (s) => {
		onChange(s);
		setOpen(false);
		setMode('browse');
		setInput('');
	};

	const usePasted = () => {
		const id = parseId(input);
		if (!id) { setError(__( "That doesn't look like a Google Sheets URL or ID.", 'quicksheet' )); return; }
		pick({ id, name: '' });
	};

	const create = async () => {
		if (!input.trim()) return;
		setBusy(true);
		setError('');
		try {
			pick(await api.createSpreadsheet(input.trim()));
		} catch (e) {
			setError(errMsg(e));
		} finally {
			setBusy(false);
		}
	};

	return (
		<div className="qs-picker" ref={ref}>
			<button type="button" className="qs-select qs-picker__trigger" disabled={disabled} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
				<Icon name="sheet" />
				<span className={value.id ? '' : 'qs-muted'}>{value.id ? value.name || value.id : __( 'Select a spreadsheet…', 'quicksheet' )}</span>
			</button>

			{open && (
				<div className="qs-picker__panel" role="dialog" aria-label={__( 'Choose spreadsheet', 'quicksheet' )}>
					<div className="qs-picker__tabs">
						{[['browse', __( 'Browse', 'quicksheet' )], ['url', __( 'Paste URL', 'quicksheet' )], ['create', __( 'Create new', 'quicksheet' )]].map(([k, l]) => (
							<button type="button" key={k} className={mode === k ? 'is-active' : ''} onClick={() => { setMode(k); setError(''); setInput(''); }}>{l}</button>
						))}
					</div>

					{mode === 'browse' && (
						<>
							<input className="qs-input" autoFocus placeholder={__( 'Search spreadsheets…', 'quicksheet' )} value={search} onChange={(e) => setSearch(e.target.value)} />
							<ul className="qs-picker__list">
								{loading && <li className="qs-picker__state">{__( 'Loading…', 'quicksheet' )}</li>}
								{!loading && error && <li className="qs-picker__state qs-text-danger">{error}</li>}
								{!loading && !error && items.length === 0 && <li className="qs-picker__state">{__( 'No spreadsheets found.', 'quicksheet' )}</li>}
								{!loading && !error && items.map((s) => (
									<li key={s.id}>
										<button type="button" className={value.id === s.id ? 'is-selected' : ''} onClick={() => pick(s)}>
											<Icon name="sheet" />
											<span>{s.name}</span>
											{s.modified && <time>{new Date(s.modified).toLocaleDateString()}</time>}
										</button>
									</li>
								))}
							</ul>
						</>
					)}

					{mode === 'url' && (
						<div className="qs-picker__form">
							<input className="qs-input" autoFocus placeholder="https://docs.google.com/spreadsheets/d/…" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && usePasted()} />
							{error && <p className="qs-text-danger">{error}</p>}
							<Button variant="primary" onClick={usePasted}>{__( 'Use this spreadsheet', 'quicksheet' )}</Button>
						</div>
					)}

					{mode === 'create' && (
						<div className="qs-picker__form">
							<input className="qs-input" autoFocus placeholder={__( 'Spreadsheet name, e.g. Website leads', 'quicksheet' )} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && create()} />
							{error && <p className="qs-text-danger">{error}</p>}
							<Button variant="primary" icon="plus" loading={busy} onClick={create}>{__( 'Create in Google Drive', 'quicksheet' )}</Button>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
