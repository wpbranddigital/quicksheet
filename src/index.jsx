import { __ } from '@wordpress/i18n';
import { ToastProvider, Icon } from './components/ui';
import Dashboard from './pages/Dashboard';
import Integrations from './pages/Integrations';
import Apps from './pages/Apps';
import Editor from './pages/Editor';
import Logs from './pages/Logs';
import Settings from './pages/Settings';
import './style.css';

const { useState, useEffect, render, createRoot } = wp.element;

const parseHash = () => {
	const h = (window.location.hash || '#/').replace(/^#/, '') || '/';
	return h.split('?')[0];
};

const NAV = [
	{ path: '/', label: __( 'Dashboard', 'quicksheet' ) },
	{ path: '/integrations', label: __( 'Integrations', 'quicksheet' ) },
	{ path: '/apps', label: __( 'Apps', 'quicksheet' ) },
	{ path: '/logs', label: __( 'Logs', 'quicksheet' ) },
	{ path: '/settings', label: __( 'Settings', 'quicksheet' ) },
];

/** Keep the WP sidebar submenu highlight in sync with the hash route. */
const syncWpMenu = (route) => {
	const items = document.querySelectorAll('#toplevel_page_quicksheet .wp-submenu li');
	items.forEach((li) => {
		const a = li.querySelector('a');
		if (!a) return;
		const href = a.getAttribute('href') || '';
		const target = href.includes('#') ? href.split('#')[1] : '/';
		const active = target === '/' ? route === '/' : route.startsWith(target);
		li.classList.toggle('current', active);
	});
};

const App = () => {
	const [route, setRoute] = useState(parseHash());

	useEffect(() => {
		const onHash = () => {
			setRoute(parseHash());
			window.scrollTo(0, 0);
		};
		window.addEventListener('hashchange', onHash);
		return () => window.removeEventListener('hashchange', onHash);
	}, []);

	useEffect(() => syncWpMenu(route), [route]);

	let page;
	let m;
	if (route === '/integrations/new') page = <Editor key="new" />;
	else if ((m = route.match(/^\/integrations\/(\d+)$/))) page = <Editor key={m[1]} id={parseInt(m[1], 10)} />;
	else if (route.startsWith('/integrations')) page = <Integrations />;
	else if (route.startsWith('/apps')) page = <Apps />;
	else if (route.startsWith('/logs')) page = <Logs />;
	else if (route.startsWith('/settings')) page = <Settings />;
	else page = <Dashboard />;

	const isActive = (p) => (p === '/' ? route === '/' : route.startsWith(p));

	return (
		<ToastProvider>
			<div className="qs-app">
				<header className="qs-topbar">
					<a className="qs-brand" href="#/">
						<span className="qs-brand__mark"><Icon name="sheet" size={18} /></span>
						<span className="qs-brand__name">QuickSheet</span>
						<span className="qs-brand__ver">v{window.QSWP.version}</span>
					</a>
					<nav className="qs-nav">
						{NAV.map((n) => (
							<a key={n.path} href={'#' + n.path} className={isActive(n.path) ? 'is-active' : ''}>
								{n.label}
							</a>
						))}
					</nav>
					<a className="qs-btn qs-btn--primary qs-topbar__cta" href="#/integrations/new">
						<Icon name="plus" />
						<span>{__( 'Create integration', 'quicksheet' )}</span>
					</a>
				</header>
				<main className="qs-main">{page}</main>
			</div>
		</ToastProvider>
	);
};

const mount = () => {
	const el = document.getElementById('qswp-app');
	if (!el) return;
	if (createRoot) createRoot(el).render(<App />);
	else render(<App />, el);
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
else mount();
