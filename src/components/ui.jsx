import { __, _n, sprintf } from '@wordpress/i18n';

const { useState, useEffect, createContext, useContext, useCallback } = wp.element;
const { Modal, Spinner: WpSpinner } = wp.components;

/* ---------------------------------------------------------------- icons */
const P = {
	plus: 'M12 5v14M5 12h14',
	sheet: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M8 12h8M8 16h8M12 12v8',
	link: 'M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1',
	edit: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
	trash: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
	play: 'M5 3l14 9-14 9z',
	retry: 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5',
	check: 'M20 6L9 17l-5-5',
	x: 'M18 6L6 18M6 6l12 12',
	clock: 'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
	google: 'M21 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h5a4.3 4.3 0 0 1-1.9 2.8v2.3h3A9 9 0 0 0 21 12.2zM12 21a8.9 8.9 0 0 0 6.2-2.3l-3-2.3a5.6 5.6 0 0 1-8.3-2.9H3.8v2.4A9 9 0 0 0 12 21zM6.9 13.5a5.4 5.4 0 0 1 0-3.4V7.7H3.8a9 9 0 0 0 0 8.2zM12 6.6a4.9 4.9 0 0 1 3.4 1.3l2.6-2.6A8.7 8.7 0 0 0 12 3a9 9 0 0 0-8.2 4.7l3.1 2.4A5.4 5.4 0 0 1 12 6.6z',
	copy: 'M8 8h12v12H8zM4 16V4h12',
	refresh: 'M21 12a9 9 0 0 1-15.5 6.3L3 16M3 12A9 9 0 0 1 18.5 5.7L21 8M21 3v5h-5M3 21v-5h5',
	arrow: 'M5 12h14M13 6l6 6-6 6',
	external: 'M14 3h7v7M21 3l-9 9M19 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5',
	wand: 'M15 4V2M15 10V8M11 6h2M17 6h2M3 21l12-12M13.5 7.5l3 3',
	eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
	form: 'M4 4h16v16H4zM8 9h8M8 13h8M8 17h5',
	alert: 'M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
	chat: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
	grid: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
	filter: 'M22 3H2l8 9.5V19l4 2v-8.5z',
	user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
	search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
	settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
};

export const Icon = ({ name, size = 16, className = '' }) => (
	<svg className={`qs-icon ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
		<path d={P[name]} />
	</svg>
);

/* ---------------------------------------------------------------- basics */
export const Button = ({ variant = 'secondary', size, icon, loading, children, className = '', ...rest }) => (
	<button type="button" className={`qs-btn qs-btn--${variant} ${size ? 'qs-btn--' + size : ''} ${className}`} disabled={loading || rest.disabled} {...rest}>
		{loading ? <span className="qs-spin" /> : icon ? <Icon name={icon} /> : null}
		{children && <span>{children}</span>}
	</button>
);

export const LinkButton = ({ variant = 'secondary', size, icon, children, ...rest }) => (
	<a className={`qs-btn qs-btn--${variant} ${size ? 'qs-btn--' + size : ''}`} {...rest}>
		{icon && <Icon name={icon} />}
		<span>{children}</span>
	</a>
);

export const Card = ({ title, subtitle, actions, children, className = '', step }) => (
	<section className={`qs-card ${className}`}>
		{(title || actions) && (
			<header className="qs-card__head">
				<div className="qs-card__titles">
					{step && <span className="qs-step">{step}</span>}
					<div>
						{title && <h2>{title}</h2>}
						{subtitle && <p>{subtitle}</p>}
					</div>
				</div>
				{actions && <div className="qs-card__actions">{actions}</div>}
			</header>
		)}
		<div className="qs-card__body">{children}</div>
	</section>
);

export const Pill = ({ tone = 'neutral', children }) => <span className={`qs-pill qs-pill--${tone}`}>{children}</span>;

export const StatusPill = ({ status }) => {
	const map = {
		success: ['success', __( 'Sent', 'quicksheet' )],
		failed: ['danger', __( 'Failed', 'quicksheet' )],
		pending: ['warning', __( 'Retrying', 'quicksheet' )],
	};
	const [tone, label] = map[status] || ['neutral', status];
	return <Pill tone={tone}>{label}</Pill>;
};

export const Toggle = ({ checked, onChange, label, disabled, ariaLabel }) => (
	<label className={`qs-toggle ${disabled ? 'is-disabled' : ''}`}>
		<input type="checkbox" checked={!!checked} disabled={disabled} aria-label={label ? undefined : ariaLabel} onChange={(e) => onChange(e.target.checked)} />
		<span className="qs-toggle__track"><span className="qs-toggle__thumb" /></span>
		{label && <span className="qs-toggle__label">{label}</span>}
	</label>
);

export const Field = ({ label, help, children, htmlFor }) => (
	<div className="qs-field">
		{label && <label className="qs-field__label" htmlFor={htmlFor}>{label}</label>}
		{children}
		{help && <p className="qs-field__help">{help}</p>}
	</div>
);

export const Spinner = ({ label }) => (
	<div className="qs-loading">
		<WpSpinner />
		{label && <span>{label}</span>}
	</div>
);

export const Empty = ({ icon = 'sheet', title, children, action }) => (
	<div className="qs-empty">
		<div className="qs-empty__icon"><Icon name={icon} size={28} /></div>
		<h3>{title}</h3>
		{children && <p>{children}</p>}
		{action}
	</div>
);

export const Notice = ({ tone = 'info', children, onClose }) => (
	<div className={`qs-notice qs-notice--${tone}`}>
		<Icon name={tone === 'success' ? 'check' : 'alert'} />
		<div>{children}</div>
		{onClose && (
			<button type="button" className="qs-notice__close" onClick={onClose} aria-label={__( 'Dismiss', 'quicksheet' )}>
				<Icon name="x" size={14} />
			</button>
		)}
	</div>
);

const LOGOS = {
	cf7: ['#1E88E5', 'CF7'],
	wpforms: ['#E27730', 'WPF'],
	elementor: ['#92003B', 'E'],
	google_sheets: ['#0F9D58', 'GS'],
	whatsapp: ['#1FAF5A', 'WA'],
	discord: ['#5865F2', 'DC'],
	facebook_page: ['#1877F2', 'FB'],
};

export const SourceLogo = ({ source, size = 32 }) => {
	const cfg = LOGOS[source] || ['#64748b', '?'];
	return (
		<span className="qs-logo" style={{ background: cfg[0], width: size, height: size, fontSize: size * 0.34 }}>
			{cfg[1]}
		</span>
	);
};

export const CopyField = ({ value }) => {
	const [copied, setCopied] = useState(false);
	const done = () => { setCopied(true); setTimeout(() => setCopied(false), 1500); };
	// navigator.clipboard only exists on HTTPS/localhost, so fall back to execCommand on plain http:// sites.
	const fallbackCopy = () => {
		const ta = document.createElement('textarea');
		ta.value = value;
		ta.setAttribute('readonly', '');
		ta.style.position = 'fixed';
		ta.style.opacity = '0';
		document.body.appendChild(ta);
		ta.select();
		let ok = false;
		try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
		document.body.removeChild(ta);
		if (ok) done();
		// eslint-disable-next-line no-alert
		else window.prompt(__( 'Copy this URL:', 'quicksheet' ), value);
	};
	const copy = () => {
		if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(value).then(done, fallbackCopy);
		else fallbackCopy();
	};
	return (
		<div className="qs-copy">
			<code>{value}</code>
			<Button size="sm" icon={copied ? 'check' : 'copy'} onClick={copy}>{copied ? __( 'Copied', 'quicksheet' ) : __( 'Copy', 'quicksheet' )}</Button>
		</div>
	);
};

/* ---------------------------------------------------------------- toasts */
const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);

export const ToastProvider = ({ children }) => {
	const [items, setItems] = useState([]);
	const push = useCallback((message, tone = 'success') => {
		const id = Date.now() + Math.random();
		setItems((list) => [...list, { id, message, tone }]);
		setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), tone === 'error' ? 7000 : 3500);
	}, []);
	return (
		<ToastCtx.Provider value={push}>
			{children}
			<div className="qs-toasts" role="status" aria-live="polite">
				{items.map((t) => (
					<div key={t.id} className={`qs-toast qs-toast--${t.tone}`}>
						<Icon name={t.tone === 'error' ? 'alert' : 'check'} />
						<span>{t.message}</span>
					</div>
				))}
			</div>
		</ToastCtx.Provider>
	);
};

/* ---------------------------------------------------------------- confirm */
export const Confirm = ({ title, children, confirmLabel, tone = 'danger', onConfirm, onCancel }) => {
	const [busy, setBusy] = useState(false);
	const label = confirmLabel || __( 'Delete', 'quicksheet' );
	return (
		<Modal title={title} onRequestClose={onCancel} className="qs-modal" size="small">
			<div className="qs-modal__body">{children}</div>
			<div className="qs-modal__foot">
				<Button onClick={onCancel}>{__( 'Cancel', 'quicksheet' )}</Button>
				<Button variant={tone} loading={busy} onClick={async () => { setBusy(true); try { await onConfirm(); } finally { setBusy(false); } }}>
					{label}
				</Button>
			</div>
		</Modal>
	);
};

/* ---------------------------------------------------------------- helpers */
export const colLetter = (i) => {
	let s = '';
	let n = i + 1;
	while (n > 0) {
		const m = (n - 1) % 26;
		s = String.fromCharCode(65 + m) + s;
		n = Math.floor((n - 1) / 26);
	}
	return s;
};

const LOADED_AT = Date.now();
export const timeAgo = (mysql) => {
	if (!mysql) return '';
	// Timestamps are in site time; compare against server "now" to avoid timezone drift.
	const d = new Date(mysql.replace(' ', 'T'));
	const serverNow = window.QSWP && window.QSWP.serverNow ? new Date(window.QSWP.serverNow.replace(' ', 'T')).getTime() + (Date.now() - LOADED_AT) : Date.now();
	const sec = Math.round((serverNow - d.getTime()) / 1000);
	if (isNaN(sec)) return mysql;
	if (sec < 60) return __( 'just now', 'quicksheet' );
	if (sec < 3600) return /* translators: %d: number of minutes */ sprintf( __( '%d min ago', 'quicksheet' ), Math.floor(sec / 60) );
	if (sec < 86400) return /* translators: %d: number of hours */ sprintf( __( '%d h ago', 'quicksheet' ), Math.floor(sec / 3600) );
	if (sec < 86400 * 7) return /* translators: %d: number of days */ sprintf( __( '%d d ago', 'quicksheet' ), Math.floor(sec / 86400) );
	return d.toLocaleDateString();
};

export const useAsync = (fn, deps = []) => {
	const [state, setState] = useState({ loading: true, data: null, error: null });
	const run = useCallback(() => {
		setState((s) => ({ ...s, loading: true, error: null }));
		return fn().then(
			(data) => setState({ loading: false, data, error: null }),
			(error) => setState({ loading: false, data: null, error })
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, deps);
	useEffect(() => { run(); }, [run]);
	return [state, run, setState];
};
