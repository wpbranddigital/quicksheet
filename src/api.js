import { __ } from '@wordpress/i18n';

const apiFetch = wp.apiFetch;
const NS = '/quicksheet/v1';

const call = (path, options = {}) => apiFetch({ path: NS + path, ...options });
const post = (path, data) => call(path, { method: 'POST', data });
const del = (path) => call(path, { method: 'DELETE' });
const qs = (obj) =>
	Object.entries(obj)
		.filter(([, v]) => v !== '' && v !== undefined && v !== null)
		.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
		.join('&');

export const api = {
	dashboard: () => call('/dashboard'),
	status: () => call('/status'),
	saveCredentials: (data) => post('/credentials', data),
	disconnect: () => post('/disconnect'),
	settings: () => call('/settings'),
	saveSettings: (data) => post('/settings', data),

	sources: () => call('/sources'),
	actions: () => call('/actions'),
	accounts: (service = '') => call(`/accounts?${qs({ service })}`),
	addAccount: (data) => post('/accounts', data),
	verifyAccount: (id) => post(`/accounts/${id}/verify`),
	deleteAccount: (id) => del(`/accounts/${id}`),
	forms: (source) => call(`/sources/${source}/forms`),
	fields: (source, formId) => call(`/sources/${source}/forms/${encodeURIComponent(formId)}/fields`),

	spreadsheets: (search = '') => call(`/spreadsheets?${qs({ search })}`),
	createSpreadsheet: (title) => post('/spreadsheets', { title }),
	spreadsheet: (id) => call(`/spreadsheets/${id}`),
	headers: (id, sheet) => call(`/spreadsheets/${id}/headers?${qs({ sheet })}`),
	setHeaders: (id, sheet, headers) => post(`/spreadsheets/${id}/headers`, { sheet, headers }),

	feeds: () => call('/feeds'),
	feed: (id) => call(`/feeds/${id}`),
	saveFeed: (data, id) => post(id ? `/feeds/${id}` : '/feeds', data),
	deleteFeed: (id) => del(`/feeds/${id}`),
	toggleFeed: (id, status) => post(`/feeds/${id}/status`, { status }),
	testFeed: (id, data = {}) => post(`/feeds/${id}/test`, data),

	logs: (params) => call(`/logs?${qs(params)}`),
	retryLog: (id) => post(`/logs/${id}/retry`),
	retryFailed: () => post('/logs/retry-failed'),
	deleteLog: (id) => del(`/logs/${id}`),
	clearLogs: (status = '') => call(`/logs?${qs({ status })}`, { method: 'DELETE' }),
};

export const errMsg = (e) => (e && e.message) || __('Something went wrong.', 'quicksheet');
