/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/api.js"
/*!********************!*\
  !*** ./src/api.js ***!
  \********************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   api: () => (/* binding */ api),
/* harmony export */   errMsg: () => (/* binding */ errMsg)
/* harmony export */ });
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);

const apiFetch = wp.apiFetch;
const NS = '/quicksheet/v1';
const call = (path, options = {}) => apiFetch({
  path: NS + path,
  ...options
});
const post = (path, data) => call(path, {
  method: 'POST',
  data
});
const del = path => call(path, {
  method: 'DELETE'
});
const qs = obj => Object.entries(obj).filter(([, v]) => v !== '' && v !== undefined && v !== null).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
const api = {
  dashboard: () => call('/dashboard'),
  status: () => call('/status'),
  saveCredentials: data => post('/credentials', data),
  disconnect: () => post('/disconnect'),
  settings: () => call('/settings'),
  saveSettings: data => post('/settings', data),
  sources: () => call('/sources'),
  actions: () => call('/actions'),
  accounts: (service = '') => call(`/accounts?${qs({
    service
  })}`),
  addAccount: data => post('/accounts', data),
  verifyAccount: id => post(`/accounts/${id}/verify`),
  deleteAccount: id => del(`/accounts/${id}`),
  forms: source => call(`/sources/${source}/forms`),
  fields: (source, formId) => call(`/sources/${source}/forms/${encodeURIComponent(formId)}/fields`),
  spreadsheets: (search = '') => call(`/spreadsheets?${qs({
    search
  })}`),
  createSpreadsheet: title => post('/spreadsheets', {
    title
  }),
  spreadsheet: id => call(`/spreadsheets/${id}`),
  headers: (id, sheet) => call(`/spreadsheets/${id}/headers?${qs({
    sheet
  })}`),
  setHeaders: (id, sheet, headers) => post(`/spreadsheets/${id}/headers`, {
    sheet,
    headers
  }),
  feeds: () => call('/feeds'),
  feed: id => call(`/feeds/${id}`),
  saveFeed: (data, id) => post(id ? `/feeds/${id}` : '/feeds', data),
  deleteFeed: id => del(`/feeds/${id}`),
  toggleFeed: (id, status) => post(`/feeds/${id}/status`, {
    status
  }),
  testFeed: (id, data = {}) => post(`/feeds/${id}/test`, data),
  logs: params => call(`/logs?${qs(params)}`),
  retryLog: id => post(`/logs/${id}/retry`),
  retryFailed: () => post('/logs/retry-failed'),
  deleteLog: id => del(`/logs/${id}`),
  clearLogs: (status = '') => call(`/logs?${qs({
    status
  })}`, {
    method: 'DELETE'
  })
};
const errMsg = e => e && e.message || (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Something went wrong.', 'quicksheet');

/***/ },

/***/ "./src/components/AccountModal.jsx"
/*!*****************************************!*\
  !*** ./src/components/AccountModal.jsx ***!
  \*****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ AccountModal)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _api__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../api */ "./src/api.js");
/* harmony import */ var _ui__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./ui */ "./src/components/ui.jsx");




const {
  useState
} = wp.element;
const {
  Modal
} = wp.components;

/**
 * Add an account for an app. Credentials are verified with the provider before they are saved.
 */
function AccountModal({
  app,
  onClose,
  onSaved
}) {
  const [values, setValues] = useState({});
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async e => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const account = await _api__WEBPACK_IMPORTED_MODULE_2__.api.addAccount({
        service: app.slug,
        name,
        credentials: values
      });
      onSaved(account);
    } catch (err) {
      setError((0,_api__WEBPACK_IMPORTED_MODULE_2__.errMsg)(err));
    } finally {
      setBusy(false);
    }
  };
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(Modal, {
    title: /* translators: %s: app name */(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Connect %s', 'quicksheet'), app.label),
    onRequestClose: onClose,
    className: "qs-modal qs-modal--form"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("form", {
    onSubmit: submit,
    className: "qs-modal__form"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-modal__app"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ui__WEBPACK_IMPORTED_MODULE_3__.SourceLogo, {
    source: app.slug,
    size: 36
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, app.description)), app.account_fields.map(f => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ui__WEBPACK_IMPORTED_MODULE_3__.Field, {
    key: f.key,
    label: f.label,
    help: f.help,
    htmlFor: `qs-acc-${f.key}`
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    id: `qs-acc-${f.key}`,
    className: "qs-input qs-input--mono",
    type: f.type === 'password' ? 'password' : 'text',
    placeholder: f.placeholder,
    value: values[f.key] || '',
    onChange: e => setValues({
      ...values,
      [f.key]: e.target.value
    }),
    autoComplete: "off",
    required: true
  }))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ui__WEBPACK_IMPORTED_MODULE_3__.Field, {
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Account name (optional)', 'quicksheet'),
    htmlFor: "qs-acc-name",
    help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Defaults to the name returned by the provider.', 'quicksheet')
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    id: "qs-acc-name",
    className: "qs-input",
    value: name,
    onChange: e => setName(e.target.value)
  })), error && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ui__WEBPACK_IMPORTED_MODULE_3__.Notice, {
    tone: "error"
  }, error), app.docs_url && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("a", {
    className: "qs-link",
    href: app.docs_url,
    target: "_blank",
    rel: "noopener noreferrer"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('How to get these credentials', 'quicksheet'), " ", (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ui__WEBPACK_IMPORTED_MODULE_3__.Icon, {
    name: "external",
    size: 12
  })), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-modal__foot"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ui__WEBPACK_IMPORTED_MODULE_3__.Button, {
    onClick: onClose
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Cancel', 'quicksheet')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ui__WEBPACK_IMPORTED_MODULE_3__.Button, {
    type: "submit",
    variant: "primary",
    icon: "check",
    loading: busy
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Verify & save', 'quicksheet')))));
}

/***/ },

/***/ "./src/components/GoogleAccount.jsx"
/*!******************************************!*\
  !*** ./src/components/GoogleAccount.jsx ***!
  \******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _api__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../api */ "./src/api.js");
/* harmony import */ var _ui__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./ui */ "./src/components/ui.jsx");




const {
  useState,
  useEffect,
  createInterpolateElement
} = wp.element;
const ext = href => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("a", {
  href: href,
  target: "_blank",
  rel: "noopener noreferrer"
});

// Translatable setup steps; tags are mapped to elements by createInterpolateElement.
const GUIDE = [[(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Open the <console>Google Cloud Console</console> and create (or select) a project.', 'quicksheet'), {
  console: ext('https://console.cloud.google.com/projectcreate')
}], [(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Enable the <sheets>Google Sheets API</sheets> and the <drive>Google Drive API</drive>.', 'quicksheet'), {
  sheets: ext('https://console.cloud.google.com/apis/library/sheets.googleapis.com'),
  drive: ext('https://console.cloud.google.com/apis/library/drive.googleapis.com')
}], [(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Under <strong>OAuth consent screen</strong>, choose <em>External</em>, fill in the app name and your email, and add yourself as a test user.', 'quicksheet'), {}], [(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Go to <creds>Credentials</creds> → <strong>Create credentials</strong> → <strong>OAuth client ID</strong> → <em>Web application</em>.', 'quicksheet'), {
  creds: ext('https://console.cloud.google.com/apis/credentials')
}], [(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Paste the <strong>Authorized redirect URI</strong> shown here, click Create, and copy the Client ID and Client Secret into the form.', 'quicksheet'), {}]];
const renderStep = ([text, map]) => createInterpolateElement(text, {
  strong: (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("strong", null),
  em: (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("em", null),
  ...map
});
const GoogleAccount = ({
  onChange
}) => {
  const toast = (0,_ui__WEBPACK_IMPORTED_MODULE_3__.useToast)();
  const [{
    loading,
    data,
    error
  }, reload, setState] = (0,_ui__WEBPACK_IMPORTED_MODULE_3__.useAsync)(() => _api__WEBPACK_IMPORTED_MODULE_2__.api.status());
  const [form, setForm] = useState({
    client_id: '',
    client_secret: ''
  });
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [editing, setEditing] = useState(false);
  const notice = window.QSWP.notice;
  const clientId = data ? data.client_id || '' : null;
  useEffect(() => {
    if (clientId !== null) setForm({
      client_id: clientId,
      client_secret: ''
    });
  }, [clientId]);
  if (loading) return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ui__WEBPACK_IMPORTED_MODULE_3__.Card, {
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Google Sheets', 'quicksheet')
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ui__WEBPACK_IMPORTED_MODULE_3__.Spinner, null));
  if (error) return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ui__WEBPACK_IMPORTED_MODULE_3__.Notice, {
    tone: "error"
  }, (0,_api__WEBPACK_IMPORTED_MODULE_2__.errMsg)(error));
  const saveCreds = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await _api__WEBPACK_IMPORTED_MODULE_2__.api.saveCredentials(form);
      setState({
        loading: false,
        data: res,
        error: null
      });
      if (onChange) onChange(res);
      setEditing(false);
      toast((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Credentials saved', 'quicksheet'));
    } catch (err) {
      toast((0,_api__WEBPACK_IMPORTED_MODULE_2__.errMsg)(err), 'error');
    } finally {
      setSaving(false);
    }
  };
  const showForm = !data.configured || editing;
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, notice.error && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ui__WEBPACK_IMPORTED_MODULE_3__.Notice, {
    tone: "error"
  }, /* translators: %s: error message from Google */(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Google authorization failed: %s', 'quicksheet'), notice.error)), notice.connected && data.connected && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ui__WEBPACK_IMPORTED_MODULE_3__.Notice, {
    tone: "success"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Google account connected successfully.', 'quicksheet')), data.last_error && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ui__WEBPACK_IMPORTED_MODULE_3__.Notice, {
    tone: "error"
  }, data.last_error), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ui__WEBPACK_IMPORTED_MODULE_3__.Card, {
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Google Sheets', 'quicksheet'),
    subtitle: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Uses your own Google Cloud OAuth app, so data goes straight from your site to Google.', 'quicksheet'),
    actions: data.connected ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ui__WEBPACK_IMPORTED_MODULE_3__.Pill, {
      tone: "success"
    }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Connected', 'quicksheet')) : data.configured ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ui__WEBPACK_IMPORTED_MODULE_3__.Pill, {
      tone: "warning"
    }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Not authorized', 'quicksheet')) : (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ui__WEBPACK_IMPORTED_MODULE_3__.Pill, null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Not configured', 'quicksheet'))
  }, data.connected ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-account"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "qs-account__avatar"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ui__WEBPACK_IMPORTED_MODULE_3__.Icon, {
    name: "google",
    size: 22
  })), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-account__info"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("strong", null, data.email || (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Google account', 'quicksheet')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", null, /* translators: %s: date and time the account was connected */(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Connected %s', 'quicksheet'), data.connected_at))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-account__actions"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("a", {
    className: "qs-btn qs-btn--secondary",
    href: data.connect_url
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ui__WEBPACK_IMPORTED_MODULE_3__.Icon, {
    name: "refresh"
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Reconnect', 'quicksheet'))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ui__WEBPACK_IMPORTED_MODULE_3__.Button, {
    variant: "ghost-danger",
    onClick: () => setConfirm(true)
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Disconnect', 'quicksheet')))) : data.configured && !editing ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-connect"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Credentials saved. Authorize QuickSheet to read your spreadsheet list and add rows.', 'quicksheet')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("a", {
    className: "qs-btn qs-btn--google",
    href: data.connect_url
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ui__WEBPACK_IMPORTED_MODULE_3__.Icon, {
    name: "google",
    size: 18
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Connect with Google', 'quicksheet')))) : null, showForm && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-setup"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("ol", {
    className: "qs-guide"
  }, GUIDE.map((g, i) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("li", {
    key: i
  }, renderStep(g)))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("form", {
    className: "qs-setup__form",
    onSubmit: saveCreds
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ui__WEBPACK_IMPORTED_MODULE_3__.Field, {
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Authorized redirect URI', 'quicksheet'),
    help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Add this exact URL to your OAuth client.', 'quicksheet')
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ui__WEBPACK_IMPORTED_MODULE_3__.CopyField, {
    value: data.redirect_uri
  })), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ui__WEBPACK_IMPORTED_MODULE_3__.Field, {
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Client ID', 'quicksheet'),
    htmlFor: "qs-cid"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    id: "qs-cid",
    className: "qs-input qs-input--mono",
    value: form.client_id,
    onChange: e => setForm({
      ...form,
      client_id: e.target.value
    }),
    placeholder: "1234567890-abc.apps.googleusercontent.com",
    required: true,
    autoComplete: "off"
  })), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ui__WEBPACK_IMPORTED_MODULE_3__.Field, {
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Client Secret', 'quicksheet'),
    htmlFor: "qs-secret",
    help: data.has_secret ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Leave blank to keep the saved secret. Stored encrypted.', 'quicksheet') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Stored encrypted in your database.', 'quicksheet')
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    id: "qs-secret",
    type: "password",
    className: "qs-input qs-input--mono",
    value: form.client_secret,
    onChange: e => setForm({
      ...form,
      client_secret: e.target.value
    }),
    placeholder: data.has_secret ? '••••••••••••' : 'GOCSPX-…',
    required: !data.has_secret,
    autoComplete: "new-password"
  })), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-inline"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ui__WEBPACK_IMPORTED_MODULE_3__.Button, {
    type: "submit",
    variant: "primary",
    loading: saving
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Save credentials', 'quicksheet')), editing && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ui__WEBPACK_IMPORTED_MODULE_3__.Button, {
    onClick: () => setEditing(false)
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Cancel', 'quicksheet'))))), data.configured && !editing && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", {
    className: "qs-foot-link"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
    type: "button",
    className: "qs-linkbtn",
    onClick: () => setEditing(true)
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Change OAuth credentials', 'quicksheet')))), confirm && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ui__WEBPACK_IMPORTED_MODULE_3__.Confirm, {
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Disconnect Google?', 'quicksheet'),
    confirmLabel: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Disconnect', 'quicksheet'),
    onCancel: () => setConfirm(false),
    onConfirm: async () => {
      try {
        const res = await _api__WEBPACK_IMPORTED_MODULE_2__.api.disconnect();
        setState({
          loading: false,
          data: res,
          error: null
        });
        if (onChange) onChange(res);
        toast((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Google account disconnected', 'quicksheet'));
      } catch (err) {
        toast((0,_api__WEBPACK_IMPORTED_MODULE_2__.errMsg)(err), 'error');
      } finally {
        setConfirm(false);
      }
    }
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Google Sheets integrations will stop sending rows until you reconnect. Failed submissions are kept in the log so you can retry them later.', 'quicksheet'))));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (GoogleAccount);

/***/ },

/***/ "./src/components/SpreadsheetPicker.jsx"
/*!**********************************************!*\
  !*** ./src/components/SpreadsheetPicker.jsx ***!
  \**********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ SpreadsheetPicker)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _api__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../api */ "./src/api.js");
/* harmony import */ var _ui__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./ui */ "./src/components/ui.jsx");




const {
  useState,
  useEffect,
  useRef
} = wp.element;
const parseId = v => {
  const m = String(v).match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (m) return m[1];
  return /^[a-zA-Z0-9-_]{20,}$/.test(v.trim()) ? v.trim() : '';
};

/**
 * Searchable spreadsheet chooser: browse Drive, paste a URL, or create a new sheet.
 */
function SpreadsheetPicker({
  value,
  onChange,
  disabled
}) {
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
    const onDoc = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = e => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  useEffect(() => {
    if (!open || mode !== 'browse') return;
    setLoading(true);
    setError('');
    const t = setTimeout(() => {
      _api__WEBPACK_IMPORTED_MODULE_2__.api.spreadsheets(search).then(setItems).catch(e => setError((0,_api__WEBPACK_IMPORTED_MODULE_2__.errMsg)(e))).finally(() => setLoading(false));
    }, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [open, search, mode]);
  const pick = s => {
    onChange(s);
    setOpen(false);
    setMode('browse');
    setInput('');
  };
  const usePasted = () => {
    const id = parseId(input);
    if (!id) {
      setError((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)("That doesn't look like a Google Sheets URL or ID.", 'quicksheet'));
      return;
    }
    pick({
      id,
      name: ''
    });
  };
  const create = async () => {
    if (!input.trim()) return;
    setBusy(true);
    setError('');
    try {
      pick(await _api__WEBPACK_IMPORTED_MODULE_2__.api.createSpreadsheet(input.trim()));
    } catch (e) {
      setError((0,_api__WEBPACK_IMPORTED_MODULE_2__.errMsg)(e));
    } finally {
      setBusy(false);
    }
  };
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-picker",
    ref: ref
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
    type: "button",
    className: "qs-select qs-picker__trigger",
    disabled: disabled,
    onClick: () => setOpen(o => !o),
    "aria-expanded": open
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ui__WEBPACK_IMPORTED_MODULE_3__.Icon, {
    name: "sheet"
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: value.id ? '' : 'qs-muted'
  }, value.id ? value.name || value.id : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Select a spreadsheet…', 'quicksheet'))), open && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-picker__panel",
    role: "dialog",
    "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Choose spreadsheet', 'quicksheet')
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-picker__tabs"
  }, [['browse', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Browse', 'quicksheet')], ['url', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Paste URL', 'quicksheet')], ['create', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Create new', 'quicksheet')]].map(([k, l]) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
    type: "button",
    key: k,
    className: mode === k ? 'is-active' : '',
    onClick: () => {
      setMode(k);
      setError('');
      setInput('');
    }
  }, l))), mode === 'browse' && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    className: "qs-input",
    autoFocus: true,
    placeholder: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Search spreadsheets…', 'quicksheet'),
    value: search,
    onChange: e => setSearch(e.target.value)
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("ul", {
    className: "qs-picker__list"
  }, loading && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("li", {
    className: "qs-picker__state"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Loading…', 'quicksheet')), !loading && error && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("li", {
    className: "qs-picker__state qs-text-danger"
  }, error), !loading && !error && items.length === 0 && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("li", {
    className: "qs-picker__state"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('No spreadsheets found.', 'quicksheet')), !loading && !error && items.map(s => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("li", {
    key: s.id
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
    type: "button",
    className: value.id === s.id ? 'is-selected' : '',
    onClick: () => pick(s)
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ui__WEBPACK_IMPORTED_MODULE_3__.Icon, {
    name: "sheet"
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", null, s.name), s.modified && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("time", null, new Date(s.modified).toLocaleDateString())))))), mode === 'url' && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-picker__form"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    className: "qs-input",
    autoFocus: true,
    placeholder: "https://docs.google.com/spreadsheets/d/\u2026",
    value: input,
    onChange: e => setInput(e.target.value),
    onKeyDown: e => e.key === 'Enter' && usePasted()
  }), error && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", {
    className: "qs-text-danger"
  }, error), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ui__WEBPACK_IMPORTED_MODULE_3__.Button, {
    variant: "primary",
    onClick: usePasted
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Use this spreadsheet', 'quicksheet'))), mode === 'create' && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-picker__form"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    className: "qs-input",
    autoFocus: true,
    placeholder: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Spreadsheet name, e.g. Website leads', 'quicksheet'),
    value: input,
    onChange: e => setInput(e.target.value),
    onKeyDown: e => e.key === 'Enter' && create()
  }), error && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", {
    className: "qs-text-danger"
  }, error), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ui__WEBPACK_IMPORTED_MODULE_3__.Button, {
    variant: "primary",
    icon: "plus",
    loading: busy,
    onClick: create
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Create in Google Drive', 'quicksheet')))));
}

/***/ },

/***/ "./src/components/TagInput.jsx"
/*!*************************************!*\
  !*** ./src/components/TagInput.jsx ***!
  \*************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SMART_TAGS: () => (/* binding */ SMART_TAGS),
/* harmony export */   TagSelect: () => (/* binding */ TagSelect),
/* harmony export */   "default": () => (/* binding */ TagInput)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);


const {
  useRef
} = wp.element;
const SMART_TAGS = [['{all_fields}', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('All fields (Label: value)', 'quicksheet')], ['{datetime}', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Submission date & time', 'quicksheet')], ['{date}', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Submission date', 'quicksheet')], ['{time}', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Submission time', 'quicksheet')], ['{form_title}', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Form title', 'quicksheet')], ['{entry_id}', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Entry ID', 'quicksheet')], ['{page_url}', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Page URL', 'quicksheet')], ['{ip}', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Visitor IP', 'quicksheet')], ['{user_agent}', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Browser / user agent', 'quicksheet')], ['{user_email}', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Logged-in user email', 'quicksheet')], ['{site_name}', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Site name', 'quicksheet')], ['{site_url}', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Site URL', 'quicksheet')]];

/** Select that lists form fields + smart tags. */
const TagSelect = ({
  fields,
  onPick,
  label,
  smart = true
}) => {
  const defaultLabel = label || (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('+ Insert field', 'quicksheet');
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("select", {
    className: "qs-select qs-select--sm qs-tagselect",
    value: "",
    onChange: e => {
      if (e.target.value) onPick(e.target.value);
    },
    "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Insert a form field or smart tag', 'quicksheet')
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("option", {
    value: ""
  }, defaultLabel), fields.length > 0 && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("optgroup", {
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Form fields', 'quicksheet')
  }, fields.map(f => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("option", {
    key: f.key,
    value: `{field:${f.key}}`
  }, f.label))), smart && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("optgroup", {
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Smart tags', 'quicksheet')
  }, SMART_TAGS.map(([t, l]) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("option", {
    key: t,
    value: t
  }, l))));
};

/** Text input / textarea with a field inserter that drops tags at the cursor. */
function TagInput({
  value,
  onChange,
  fields,
  multiline,
  rows = 5,
  placeholder,
  id
}) {
  const ref = useRef(null);
  const insert = tag => {
    const el = ref.current;
    const v = value || '';
    if (!el || typeof el.selectionStart !== 'number') {
      onChange(v + tag);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    onChange(v.slice(0, start) + tag + v.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + tag.length;
    });
  };
  const props = {
    id,
    ref,
    value: value || '',
    placeholder,
    className: `qs-input ${multiline ? 'qs-textarea' : ''}`,
    onChange: e => onChange(e.target.value)
  };
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-taginput"
  }, multiline ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("textarea", {
    rows: rows,
    ...props
  }) : (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    type: "text",
    ...props
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(TagSelect, {
    fields: fields,
    onPick: insert
  }));
}

/***/ },

/***/ "./src/components/ui.jsx"
/*!*******************************!*\
  !*** ./src/components/ui.jsx ***!
  \*******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Button: () => (/* binding */ Button),
/* harmony export */   Card: () => (/* binding */ Card),
/* harmony export */   Confirm: () => (/* binding */ Confirm),
/* harmony export */   CopyField: () => (/* binding */ CopyField),
/* harmony export */   Empty: () => (/* binding */ Empty),
/* harmony export */   Field: () => (/* binding */ Field),
/* harmony export */   Icon: () => (/* binding */ Icon),
/* harmony export */   LinkButton: () => (/* binding */ LinkButton),
/* harmony export */   Notice: () => (/* binding */ Notice),
/* harmony export */   Pill: () => (/* binding */ Pill),
/* harmony export */   SourceLogo: () => (/* binding */ SourceLogo),
/* harmony export */   Spinner: () => (/* binding */ Spinner),
/* harmony export */   StatusPill: () => (/* binding */ StatusPill),
/* harmony export */   ToastProvider: () => (/* binding */ ToastProvider),
/* harmony export */   Toggle: () => (/* binding */ Toggle),
/* harmony export */   colLetter: () => (/* binding */ colLetter),
/* harmony export */   timeAgo: () => (/* binding */ timeAgo),
/* harmony export */   useAsync: () => (/* binding */ useAsync),
/* harmony export */   useToast: () => (/* binding */ useToast)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);


const {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback
} = wp.element;
const {
  Modal,
  Spinner: WpSpinner
} = wp.components;

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
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z'
};
const Icon = ({
  name,
  size = 16,
  className = ''
}) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("svg", {
  className: `qs-icon ${className}`,
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
  d: P[name]
}));

/* ---------------------------------------------------------------- basics */
const Button = ({
  variant = 'secondary',
  size,
  icon,
  loading,
  children,
  className = '',
  ...rest
}) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
  type: "button",
  className: `qs-btn qs-btn--${variant} ${size ? 'qs-btn--' + size : ''} ${className}`,
  disabled: loading || rest.disabled,
  ...rest
}, loading ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
  className: "qs-spin"
}) : icon ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(Icon, {
  name: icon
}) : null, children && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", null, children));
const LinkButton = ({
  variant = 'secondary',
  size,
  icon,
  children,
  ...rest
}) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("a", {
  className: `qs-btn qs-btn--${variant} ${size ? 'qs-btn--' + size : ''}`,
  ...rest
}, icon && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(Icon, {
  name: icon
}), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", null, children));
const Card = ({
  title,
  subtitle,
  actions,
  children,
  className = '',
  step
}) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("section", {
  className: `qs-card ${className}`
}, (title || actions) && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("header", {
  className: "qs-card__head"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
  className: "qs-card__titles"
}, step && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
  className: "qs-step"
}, step), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", null, title && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("h2", null, title), subtitle && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, subtitle))), actions && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
  className: "qs-card__actions"
}, actions)), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
  className: "qs-card__body"
}, children));
const Pill = ({
  tone = 'neutral',
  children
}) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
  className: `qs-pill qs-pill--${tone}`
}, children);
const StatusPill = ({
  status
}) => {
  const map = {
    success: ['success', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Sent', 'quicksheet')],
    failed: ['danger', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Failed', 'quicksheet')],
    pending: ['warning', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Retrying', 'quicksheet')]
  };
  const [tone, label] = map[status] || ['neutral', status];
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(Pill, {
    tone: tone
  }, label);
};
const Toggle = ({
  checked,
  onChange,
  label,
  disabled,
  ariaLabel
}) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("label", {
  className: `qs-toggle ${disabled ? 'is-disabled' : ''}`
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
  type: "checkbox",
  checked: !!checked,
  disabled: disabled,
  "aria-label": label ? undefined : ariaLabel,
  onChange: e => onChange(e.target.checked)
}), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
  className: "qs-toggle__track"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
  className: "qs-toggle__thumb"
})), label && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
  className: "qs-toggle__label"
}, label));
const Field = ({
  label,
  help,
  children,
  htmlFor
}) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
  className: "qs-field"
}, label && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("label", {
  className: "qs-field__label",
  htmlFor: htmlFor
}, label), children, help && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", {
  className: "qs-field__help"
}, help));
const Spinner = ({
  label
}) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
  className: "qs-loading"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(WpSpinner, null), label && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", null, label));
const Empty = ({
  icon = 'sheet',
  title,
  children,
  action
}) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
  className: "qs-empty"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
  className: "qs-empty__icon"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(Icon, {
  name: icon,
  size: 28
})), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("h3", null, title), children && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, children), action);
const Notice = ({
  tone = 'info',
  children,
  onClose
}) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
  className: `qs-notice qs-notice--${tone}`
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(Icon, {
  name: tone === 'success' ? 'check' : 'alert'
}), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", null, children), onClose && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
  type: "button",
  className: "qs-notice__close",
  onClick: onClose,
  "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Dismiss', 'quicksheet')
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(Icon, {
  name: "x",
  size: 14
})));
const LOGOS = {
  cf7: ['#1E88E5', 'CF7'],
  wpforms: ['#E27730', 'WPF'],
  elementor: ['#92003B', 'E'],
  google_sheets: ['#0F9D58', 'GS'],
  whatsapp: ['#1FAF5A', 'WA'],
  discord: ['#5865F2', 'DC'],
  facebook_page: ['#1877F2', 'FB']
};
const SourceLogo = ({
  source,
  size = 32
}) => {
  const cfg = LOGOS[source] || ['#64748b', '?'];
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "qs-logo",
    style: {
      background: cfg[0],
      width: size,
      height: size,
      fontSize: size * 0.34
    }
  }, cfg[1]);
};
const CopyField = ({
  value
}) => {
  const [copied, setCopied] = useState(false);
  const done = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
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
    try {
      ok = document.execCommand('copy');
    } catch (e) {
      ok = false;
    }
    document.body.removeChild(ta);
    if (ok) done();
    // eslint-disable-next-line no-alert
    else window.prompt((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Copy this URL:', 'quicksheet'), value);
  };
  const copy = () => {
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(value).then(done, fallbackCopy);else fallbackCopy();
  };
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-copy"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("code", null, value), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(Button, {
    size: "sm",
    icon: copied ? 'check' : 'copy',
    onClick: copy
  }, copied ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Copied', 'quicksheet') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Copy', 'quicksheet')));
};

/* ---------------------------------------------------------------- toasts */
const ToastCtx = createContext(() => {});
const useToast = () => useContext(ToastCtx);
const ToastProvider = ({
  children
}) => {
  const [items, setItems] = useState([]);
  const push = useCallback((message, tone = 'success') => {
    const id = Date.now() + Math.random();
    setItems(list => [...list, {
      id,
      message,
      tone
    }]);
    setTimeout(() => setItems(list => list.filter(t => t.id !== id)), tone === 'error' ? 7000 : 3500);
  }, []);
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(ToastCtx.Provider, {
    value: push
  }, children, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-toasts",
    role: "status",
    "aria-live": "polite"
  }, items.map(t => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    key: t.id,
    className: `qs-toast qs-toast--${t.tone}`
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(Icon, {
    name: t.tone === 'error' ? 'alert' : 'check'
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", null, t.message)))));
};

/* ---------------------------------------------------------------- confirm */
const Confirm = ({
  title,
  children,
  confirmLabel,
  tone = 'danger',
  onConfirm,
  onCancel
}) => {
  const [busy, setBusy] = useState(false);
  const label = confirmLabel || (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Delete', 'quicksheet');
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(Modal, {
    title: title,
    onRequestClose: onCancel,
    className: "qs-modal",
    size: "small"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-modal__body"
  }, children), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-modal__foot"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(Button, {
    onClick: onCancel
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Cancel', 'quicksheet')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(Button, {
    variant: tone,
    loading: busy,
    onClick: async () => {
      setBusy(true);
      try {
        await onConfirm();
      } finally {
        setBusy(false);
      }
    }
  }, label)));
};

/* ---------------------------------------------------------------- helpers */
const colLetter = i => {
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
const timeAgo = mysql => {
  if (!mysql) return '';
  // Timestamps are in site time; compare against server "now" to avoid timezone drift.
  const d = new Date(mysql.replace(' ', 'T'));
  const serverNow = window.QSWP && window.QSWP.serverNow ? new Date(window.QSWP.serverNow.replace(' ', 'T')).getTime() + (Date.now() - LOADED_AT) : Date.now();
  const sec = Math.round((serverNow - d.getTime()) / 1000);
  if (isNaN(sec)) return mysql;
  if (sec < 60) return (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('just now', 'quicksheet');
  if (sec < 3600) return /* translators: %d: number of minutes */(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('%d min ago', 'quicksheet'), Math.floor(sec / 60));
  if (sec < 86400) return /* translators: %d: number of hours */(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('%d h ago', 'quicksheet'), Math.floor(sec / 3600));
  if (sec < 86400 * 7) return /* translators: %d: number of days */(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('%d d ago', 'quicksheet'), Math.floor(sec / 86400));
  return d.toLocaleDateString();
};
const useAsync = (fn, deps = []) => {
  const [state, setState] = useState({
    loading: true,
    data: null,
    error: null
  });
  const run = useCallback(() => {
    setState(s => ({
      ...s,
      loading: true,
      error: null
    }));
    return fn().then(data => setState({
      loading: false,
      data,
      error: null
    }), error => setState({
      loading: false,
      data: null,
      error
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => {
    run();
  }, [run]);
  return [state, run, setState];
};

/***/ },

/***/ "./src/pages/Apps.jsx"
/*!****************************!*\
  !*** ./src/pages/Apps.jsx ***!
  \****************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Apps)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _api__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../api */ "./src/api.js");
/* harmony import */ var _components_ui__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../components/ui */ "./src/components/ui.jsx");
/* harmony import */ var _components_GoogleAccount__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../components/GoogleAccount */ "./src/components/GoogleAccount.jsx");
/* harmony import */ var _components_AccountModal__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../components/AccountModal */ "./src/components/AccountModal.jsx");






const {
  useState
} = wp.element;
const CATEGORY = {
  productivity: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Spreadsheets', 'quicksheet'),
  chat: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Messaging', 'quicksheet'),
  social: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Social media', 'quicksheet')
};
const AppCard = ({
  app,
  onAdd,
  onDelete,
  onVerify,
  verifying
}) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.Card, {
  className: "qs-appbox"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
  className: "qs-appbox__head"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.SourceLogo, {
  source: app.slug,
  size: 44
}), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
  className: "qs-appbox__title"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("h2", null, app.label), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
  className: "qs-muted"
}, CATEGORY[app.category] || app.category)), app.accounts.length ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.Pill, {
  tone: "success"
}, /* translators: %d: number of connected accounts */(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('%d connected', 'quicksheet'), app.accounts.length)) : (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.Pill, null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Not connected', 'quicksheet'))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", {
  className: "qs-appbox__desc"
}, app.description), app.accounts.length > 0 && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("ul", {
  className: "qs-accounts"
}, app.accounts.map(acc => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("li", {
  key: acc.id
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.Icon, {
  name: "user",
  size: 14
}), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
  className: "qs-accounts__name"
}, acc.name), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
  className: "qs-muted qs-accounts__date"
}, (0,_components_ui__WEBPACK_IMPORTED_MODULE_3__.timeAgo)(acc.created_at)), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.Button, {
  size: "sm",
  icon: "refresh",
  loading: verifying === acc.id,
  onClick: () => onVerify(acc),
  "aria-label": /* translators: %s: account name */(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Check %s', 'quicksheet'), acc.name),
  title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Check connection', 'quicksheet')
}), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.Button, {
  size: "sm",
  variant: "ghost-danger",
  icon: "trash",
  onClick: () => onDelete(acc),
  "aria-label": /* translators: %s: account name */(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Remove %s', 'quicksheet'), acc.name)
})))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
  className: "qs-appbox__foot"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.Button, {
  variant: app.accounts.length ? 'secondary' : 'primary',
  icon: "plus",
  onClick: () => onAdd(app)
}, app.accounts.length ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Add another', 'quicksheet') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Connect', 'quicksheet')), app.docs_url && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("a", {
  className: "qs-link",
  href: app.docs_url,
  target: "_blank",
  rel: "noopener noreferrer"
}, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Setup guide', 'quicksheet'), " ", (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.Icon, {
  name: "external",
  size: 12
}))));
function Apps() {
  const toast = (0,_components_ui__WEBPACK_IMPORTED_MODULE_3__.useToast)();
  const [{
    loading,
    data,
    error
  }, reload] = (0,_components_ui__WEBPACK_IMPORTED_MODULE_3__.useAsync)(() => _api__WEBPACK_IMPORTED_MODULE_2__.api.actions());
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [verifying, setVerifying] = useState(0);
  const verify = async acc => {
    setVerifying(acc.id);
    try {
      const res = await _api__WEBPACK_IMPORTED_MODULE_2__.api.verifyAccount(acc.id);
      toast(/* translators: %s: account name */(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('%s is working', 'quicksheet'), res.name));
    } catch (e) {
      toast((0,_api__WEBPACK_IMPORTED_MODULE_2__.errMsg)(e), 'error');
    } finally {
      setVerifying(0);
    }
  };
  if (loading) return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.Spinner, {
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Loading apps…', 'quicksheet')
  });
  if (error) return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.Notice, {
    tone: "error"
  }, (0,_api__WEBPACK_IMPORTED_MODULE_2__.errMsg)(error));
  const accountApps = data.filter(a => a.uses_accounts);
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-page"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-pagehead"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("h1", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Apps', 'quicksheet')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Connect the apps your integrations send data to. Credentials are verified with the provider and stored encrypted.', 'quicksheet')))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_GoogleAccount__WEBPACK_IMPORTED_MODULE_4__["default"], null), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-appboxes"
  }, accountApps.map(a => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(AppCard, {
    key: a.slug,
    app: a,
    onAdd: setModal,
    onDelete: setConfirm,
    onVerify: verify,
    verifying: verifying
  }))), modal && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_AccountModal__WEBPACK_IMPORTED_MODULE_5__["default"], {
    app: modal,
    onClose: () => setModal(null),
    onSaved: acc => {
      setModal(null);
      toast(/* translators: %s: account name */(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('%s connected', 'quicksheet'), acc.name));
      reload();
    }
  }), confirm && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.Confirm, {
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Remove account?', 'quicksheet'),
    confirmLabel: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Remove', 'quicksheet'),
    onCancel: () => setConfirm(null),
    onConfirm: async () => {
      try {
        await _api__WEBPACK_IMPORTED_MODULE_2__.api.deleteAccount(confirm.id);
        toast((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Account removed', 'quicksheet'));
        setConfirm(null);
        reload();
      } catch (e) {
        toast((0,_api__WEBPACK_IMPORTED_MODULE_2__.errMsg)(e), 'error');
        setConfirm(null);
      }
    }
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("strong", null, confirm.name), " ", (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('and its saved credentials will be deleted from this site.', 'quicksheet'))));
}

/***/ },

/***/ "./src/pages/Dashboard.jsx"
/*!*********************************!*\
  !*** ./src/pages/Dashboard.jsx ***!
  \*********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Dashboard)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _api__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../api */ "./src/api.js");
/* harmony import */ var _components_ui__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../components/ui */ "./src/components/ui.jsx");




const Stat = ({
  label,
  value,
  tone,
  icon
}) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
  className: `qs-stat qs-stat--${tone}`
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
  className: "qs-stat__icon"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.Icon, {
  name: icon,
  size: 18
})), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
  className: "qs-stat__value"
}, value), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
  className: "qs-stat__label"
}, label)));
const Chart = ({
  series
}) => {
  const max = Math.max(1, ...series.map(d => d.success + d.failed));
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-chart",
    role: "img",
    "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Deliveries per day over the last 14 days', 'quicksheet')
  }, series.map(d => {
    const total = d.success + d.failed;
    const label = new Date(d.date + 'T00:00:00').toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    });
    return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "qs-chart__col",
      key: d.date,
      title: /* translators: 1: date, 2: number sent, 3: number failed */(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('%1$s: %2$d sent, %3$d failed', 'quicksheet'), label, d.success, d.failed)
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "qs-chart__bar",
      style: {
        height: `${total / max * 100}%`
      }
    }, d.failed > 0 && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
      className: "qs-chart__fail",
      style: {
        height: `${d.failed / total * 100}%`
      }
    })), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
      className: "qs-chart__x"
    }, label.split(' ')[1] || label));
  }));
};
const Checklist = ({
  data
}) => {
  const anySource = data.sources.some(s => s.active);
  const steps = [{
    done: data.apps.some(a => a.connected),
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Connect an app', 'quicksheet'),
    desc: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Google Sheets, WhatsApp, Discord or a Facebook Page.', 'quicksheet'),
    href: '#/apps',
    cta: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Open apps', 'quicksheet')
  }, {
    done: anySource,
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Activate a form plugin', 'quicksheet'),
    desc: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Contact Form 7, WPForms or Elementor Pro.', 'quicksheet'),
    href: `${window.QSWP.adminUrl}plugin-install.php?s=contact+form+7&tab=search&type=term`,
    cta: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Install', 'quicksheet')
  }, {
    done: data.feeds > 0,
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Create your first integration', 'quicksheet'),
    desc: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Pick a form, an app, and map the fields.', 'quicksheet'),
    href: '#/integrations/new',
    cta: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Create', 'quicksheet')
  }];
  if (steps.every(s => s.done)) return null;
  const doneCount = steps.filter(s => s.done).length;
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.Card, {
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Get started', 'quicksheet'),
    subtitle: /* translators: %d: number of completed steps */(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('%d of 3 steps complete', 'quicksheet'), doneCount),
    className: "qs-onboard"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("ol", {
    className: "qs-checklist"
  }, steps.map((s, i) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("li", {
    key: i,
    className: s.done ? 'is-done' : ''
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "qs-checklist__dot"
  }, s.done ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.Icon, {
    name: "check",
    size: 14
  }) : i + 1), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-checklist__text"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("strong", null, s.title), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", null, s.desc)), !s.done && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.LinkButton, {
    href: s.href,
    size: "sm"
  }, s.cta)))));
};
function Dashboard() {
  const [{
    loading,
    data,
    error
  }] = (0,_components_ui__WEBPACK_IMPORTED_MODULE_3__.useAsync)(() => _api__WEBPACK_IMPORTED_MODULE_2__.api.dashboard());
  if (loading) return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.Spinner, {
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Loading dashboard…', 'quicksheet')
  });
  if (error) return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.Notice, {
    tone: "error"
  }, error.message);
  const {
    stats
  } = data;
  const total30 = stats.success + stats.failed + stats.pending;
  const rate = total30 ? Math.round(stats.success / total30 * 100) : 100;
  const notice = window.QSWP.notice;
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-page"
  }, notice.connected && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.Notice, {
    tone: "success"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Google account connected successfully.', 'quicksheet')), data.google.last_error && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.Notice, {
    tone: "error"
  }, data.google.last_error, " ", (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("a", {
    href: "#/apps"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Reconnect', 'quicksheet'))), stats.failed > 0 && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.Notice, {
    tone: "warning"
  }, /* translators: %d: number of failed submissions */(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('%d submission(s) could not be delivered.', 'quicksheet'), stats.failed), " ", (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("a", {
    href: "#/logs"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Review and retry', 'quicksheet'))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-pagehead"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("h1", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Dashboard', 'quicksheet')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Every form submission, delivered to your sheets, chats and pages.', 'quicksheet')))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(Checklist, {
    data: data
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-stats"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(Stat, {
    icon: "link",
    tone: "brand",
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Active integrations', 'quicksheet'),
    value: `${data.active_feeds}/${data.feeds}`
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(Stat, {
    icon: "check",
    tone: "success",
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Delivered today', 'quicksheet'),
    value: stats.today
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(Stat, {
    icon: "sheet",
    tone: "info",
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Success rate (30 days)', 'quicksheet'),
    value: `${rate}%`
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(Stat, {
    icon: "alert",
    tone: stats.failed ? 'danger' : 'muted',
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Failed (30 days)', 'quicksheet'),
    value: stats.failed + stats.pending
  })), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-grid-2"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.Card, {
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Last 14 days', 'quicksheet'),
    subtitle: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Deliveries across all apps', 'quicksheet')
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(Chart, {
    series: stats.series
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-legend"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("i", {
    className: "qs-legend__ok"
  }), " ", (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Sent', 'quicksheet')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("i", {
    className: "qs-legend__bad"
  }), " ", (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Failed', 'quicksheet')))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.Card, {
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Triggers & apps', 'quicksheet'),
    subtitle: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)("What's connected on this site", 'quicksheet')
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("ul", {
    className: "qs-sources"
  }, data.sources.map(s => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("li", {
    key: s.slug
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.SourceLogo, {
    source: s.slug
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "qs-sources__name"
  }, s.label), s.active ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.Pill, {
    tone: "success"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Active', 'quicksheet')) : s.install_url ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("a", {
    href: s.install_url
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Install', 'quicksheet')) : (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.Pill, null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Not installed', 'quicksheet'))))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("ul", {
    className: "qs-sources qs-sources--apps"
  }, data.apps.map(a => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("li", {
    key: a.slug
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.SourceLogo, {
    source: a.slug
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "qs-sources__name"
  }, a.label), a.connected ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.Pill, {
    tone: "success"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Connected', 'quicksheet')) : (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("a", {
    href: "#/apps"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Connect', 'quicksheet')), a.connected && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "qs-sources__count"
  }, /* translators: %d: number of delivered submissions */(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('%d sent', 'quicksheet'), stats.by_action && stats.by_action[a.slug] || 0))))))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.Card, {
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Recent activity', 'quicksheet'),
    actions: (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("a", {
      href: "#/logs",
      className: "qs-link"
    }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('View all logs', 'quicksheet'), " ", (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.Icon, {
      name: "arrow",
      size: 14
    }))
  }, data.recent.length === 0 ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", {
    className: "qs-muted"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('No submissions yet. Once a form with an active integration is submitted, it shows up here.', 'quicksheet')) : (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("ul", {
    className: "qs-activity"
  }, data.recent.map(l => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("li", {
    key: l.id
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.StatusPill, {
    status: l.status
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.SourceLogo, {
    source: l.action || 'google_sheets',
    size: 22
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "qs-activity__name"
  }, l.feed_name || /* translators: %d: integration ID */(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Integration #%d', 'quicksheet'), l.feed_id)), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "qs-activity__msg"
  }, l.message), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("time", null, (0,_components_ui__WEBPACK_IMPORTED_MODULE_3__.timeAgo)(l.created_at)))))));
}

/***/ },

/***/ "./src/pages/Editor.jsx"
/*!******************************!*\
  !*** ./src/pages/Editor.jsx ***!
  \******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Editor)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _api__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../api */ "./src/api.js");
/* harmony import */ var _router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../router */ "./src/router.js");
/* harmony import */ var _components_ui__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../components/ui */ "./src/components/ui.jsx");
/* harmony import */ var _components_SpreadsheetPicker__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../components/SpreadsheetPicker */ "./src/components/SpreadsheetPicker.jsx");
/* harmony import */ var _components_AccountModal__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../components/AccountModal */ "./src/components/AccountModal.jsx");
/* harmony import */ var _components_TagInput__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../components/TagInput */ "./src/components/TagInput.jsx");








const {
  useState,
  useEffect,
  useMemo,
  useCallback
} = wp.element;
const DEFAULT_SETTINGS = {
  google_sheets: {},
  discord: {
    message: '**New submission: {form_title}**\n{all_fields}',
    username: '',
    use_embed: false,
    embed_title: 'New {form_title} submission',
    embed_color: '#12855a'
  },
  whatsapp: {
    recipient: '',
    message_type: 'text',
    message: 'New submission from {form_title}\n\n{all_fields}',
    template_name: '',
    template_language: 'en_US',
    template_params: []
  },
  facebook_page: {
    message: '',
    link: ''
  }
};
const EMPTY_CONDITION = {
  enabled: false,
  match: 'all',
  rules: []
};
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
  settings: {
    condition: EMPTY_CONDITION
  },
  status: true
};
const OPERATORS = [['equals', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('is', 'quicksheet')], ['not_equals', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('is not', 'quicksheet')], ['contains', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('contains', 'quicksheet')], ['not_contains', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('does not contain', 'quicksheet')], ['starts_with', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('starts with', 'quicksheet')], ['empty', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('is empty', 'quicksheet')], ['not_empty', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('is not empty', 'quicksheet')], ['greater_than', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('greater than', 'quicksheet')], ['less_than', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('less than', 'quicksheet')]];
const norm = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

/* ------------------------------------------------------------ value picker (sheets) */
const ValuePicker = ({
  value,
  fields,
  onChange
}) => {
  const options = useMemo(() => [...fields.map(f => `{field:${f.key}}`), ..._components_TagInput__WEBPACK_IMPORTED_MODULE_7__.SMART_TAGS.map(t => t[0])], [fields]);
  // Custom mode is derived, so it stays correct when form fields finish loading after the map.
  const [forceCustom, setCustom] = useState(false);
  const custom = forceCustom || value !== '' && !options.includes(value);
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-valuepicker"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("select", {
    className: "qs-select",
    value: custom ? '__custom' : value,
    onChange: e => {
      const v = e.target.value;
      if (v === '__custom') {
        setCustom(true);
      } else {
        setCustom(false);
        onChange(v);
      }
    }
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("option", {
    value: ""
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('— Leave empty —', 'quicksheet')), fields.length > 0 && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("optgroup", {
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Form fields', 'quicksheet')
  }, fields.map(f => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("option", {
    key: f.key,
    value: `{field:${f.key}}`
  }, f.label, f.label !== f.key ? ` (${f.key})` : ''))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("optgroup", {
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Smart tags', 'quicksheet')
  }, _components_TagInput__WEBPACK_IMPORTED_MODULE_7__.SMART_TAGS.map(([tag, label]) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("option", {
    key: tag,
    value: tag
  }, label))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("option", {
    value: "__custom"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Custom value / combine…', 'quicksheet'))), custom && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    type: "text",
    className: "qs-input qs-input--mono",
    value: value,
    placeholder: "e.g. {field:first-name} {field:last-name}",
    onChange: e => onChange(e.target.value)
  }));
};

/* ------------------------------------------------------------ Google Sheets config */
const SheetsConfig = ({
  feed,
  set,
  fields,
  google,
  map,
  setMap
}) => {
  const toast = (0,_components_ui__WEBPACK_IMPORTED_MODULE_4__.useToast)();
  const [tabs, setTabs] = useState({
    loading: false,
    items: [],
    error: null
  });
  const [headers, setHeaders] = useState({
    loading: false,
    items: [],
    error: null
  });
  const [extraCols, setExtraCols] = useState(0);
  const [writing, setWriting] = useState(false);
  useEffect(() => {
    if (!feed.spreadsheet_id || !google.connected) {
      setTabs({
        loading: false,
        items: [],
        error: null
      });
      return;
    }
    setTabs({
      loading: true,
      items: [],
      error: null
    });
    _api__WEBPACK_IMPORTED_MODULE_2__.api.spreadsheet(feed.spreadsheet_id).then(res => {
      setTabs({
        loading: false,
        items: res.sheets,
        error: null
      });
      set(f => ({
        spreadsheet_name: f.spreadsheet_name || res.title,
        sheet_name: f.sheet_name && res.sheets.some(s => s.title === f.sheet_name) ? f.sheet_name : res.sheets[0] ? res.sheets[0].title : ''
      }));
    }).catch(e => setTabs({
      loading: false,
      items: [],
      error: (0,_api__WEBPACK_IMPORTED_MODULE_2__.errMsg)(e)
    }));
  }, [feed.spreadsheet_id, google.connected, set]);
  const loadHeaders = () => {
    if (!feed.spreadsheet_id || !feed.sheet_name) {
      setHeaders({
        loading: false,
        items: [],
        error: null
      });
      return;
    }
    setHeaders(h => ({
      ...h,
      loading: true,
      error: null
    }));
    _api__WEBPACK_IMPORTED_MODULE_2__.api.headers(feed.spreadsheet_id, feed.sheet_name).then(items => setHeaders({
      loading: false,
      items,
      error: null
    })).catch(e => setHeaders({
      loading: false,
      items: [],
      error: (0,_api__WEBPACK_IMPORTED_MODULE_2__.errMsg)(e)
    }));
  };
  useEffect(loadHeaders, [feed.spreadsheet_id, feed.sheet_name]);
  const columnCount = useMemo(() => {
    const mapped = Object.keys(map).map(Number);
    const maxMapped = mapped.length ? Math.max(...mapped) + 1 : 0;
    return Math.max(headers.items.length, maxMapped, headers.items.length ? 0 : 1) + extraCols;
  }, [headers.items, map, extraCols]);
  const autoMap = () => {
    const next = {
      ...map
    };
    let hits = 0;
    headers.items.forEach((h, i) => {
      if (next[i]) return;
      const n = norm(h);
      if (!n) return;
      const f = fields.find(x => norm(x.label) === n || norm(x.key) === n || norm(x.key).replace(/^your/, '') === n);
      if (f) {
        next[i] = `{field:${f.key}}`;
        hits++;
        return;
      }
      const tag = _components_TagInput__WEBPACK_IMPORTED_MODULE_7__.SMART_TAGS.find(([t, l]) => norm(l) === n || norm(t) === n);
      if (tag) {
        next[i] = tag[0];
        hits++;
        return;
      }
      if (['date', 'timestamp', 'submittedat', 'submitted', 'datetime', 'time'].includes(n)) {
        next[i] = '{datetime}';
        hits++;
      }
    });
    setMap(next);
    toast(hits ? /* translators: %d: number of matched columns */(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Matched %d column(s)', 'quicksheet'), hits) : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('No matching column names found', 'quicksheet'), hits ? 'success' : 'error');
  };
  const createHeaderRow = async () => {
    const hdrs = [...fields.map(f => f.label), (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Submitted At', 'quicksheet')];
    setWriting(true);
    try {
      await _api__WEBPACK_IMPORTED_MODULE_2__.api.setHeaders(feed.spreadsheet_id, feed.sheet_name, hdrs);
      const m = {};
      fields.forEach((f, i) => {
        m[i] = `{field:${f.key}}`;
      });
      m[fields.length] = '{datetime}';
      setMap(m);
      setExtraCols(0);
      setHeaders({
        loading: false,
        items: hdrs,
        error: null
      });
      toast((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Header row created and fields mapped', 'quicksheet'));
    } catch (e) {
      toast((0,_api__WEBPACK_IMPORTED_MODULE_2__.errMsg)(e), 'error');
    } finally {
      setWriting(false);
    }
  };
  if (!google.connected) {
    return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Notice, {
      tone: "warning"
    }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)("Google isn't connected yet.", 'quicksheet'), " ", (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("a", {
      href: "#/apps"
    }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Connect Google Sheets in Apps', 'quicksheet')), " ", (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('first.', 'quicksheet'));
  }
  const ready = feed.spreadsheet_id && feed.sheet_name && !tabs.error;
  const mapped = Object.values(map).filter(v => v && v.trim()).length;
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-row-2"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Field, {
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Spreadsheet', 'quicksheet')
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_SpreadsheetPicker__WEBPACK_IMPORTED_MODULE_5__["default"], {
    value: {
      id: feed.spreadsheet_id,
      name: feed.spreadsheet_name
    },
    onChange: s => {
      set({
        spreadsheet_id: s.id,
        spreadsheet_name: s.name,
        sheet_name: ''
      });
      setMap({});
      setExtraCols(0);
    }
  })), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Field, {
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Sheet tab', 'quicksheet'),
    htmlFor: "qs-tab"
  }, tabs.loading ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Spinner, null) : (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("select", {
    id: "qs-tab",
    className: "qs-select",
    value: feed.sheet_name,
    disabled: !tabs.items.length,
    onChange: e => {
      set({
        sheet_name: e.target.value
      });
      setMap({});
      setExtraCols(0);
    }
  }, !tabs.items.length && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("option", {
    value: ""
  }, "\u2014"), tabs.items.map(t => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("option", {
    key: t.id,
    value: t.title
  }, t.title))))), tabs.error && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Notice, {
    tone: "error"
  }, tabs.error), ready && feed.form_id && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-subsection"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-subsection__head"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("strong", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Field mapping', 'quicksheet')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-inline"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("a", {
    className: "qs-link",
    href: `https://docs.google.com/spreadsheets/d/${feed.spreadsheet_id}/edit`,
    target: "_blank",
    rel: "noopener noreferrer"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Open sheet', 'quicksheet'), " ", (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Icon, {
    name: "external",
    size: 12
  })), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Button, {
    size: "sm",
    icon: "refresh",
    onClick: loadHeaders,
    loading: headers.loading
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Reload headers', 'quicksheet')), headers.items.length > 0 && fields.length > 0 && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Button, {
    size: "sm",
    icon: "wand",
    onClick: autoMap
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Auto-map', 'quicksheet')))), headers.loading ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Spinner, {
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Reading sheet headers…', 'quicksheet')
  }) : (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, headers.error && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Notice, {
    tone: "error"
  }, headers.error), headers.items.length === 0 && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-callout"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("strong", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('This tab has no header row.', 'quicksheet')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Create one from your form fields and everything gets mapped automatically — or map columns manually below.', 'quicksheet'))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Button, {
    variant: "primary",
    icon: "wand",
    loading: writing,
    disabled: !fields.length,
    onClick: createHeaderRow
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Create header row', 'quicksheet'))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-table-wrap"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("table", {
    className: "qs-table qs-maptable"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("thead", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("tr", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("th", {
    style: {
      width: 56
    }
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Col', 'quicksheet')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("th", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Sheet column', 'quicksheet')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("th", {
    "aria-hidden": "true",
    style: {
      width: 28
    }
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("th", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Value', 'quicksheet')))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("tbody", null, Array.from({
    length: columnCount
  }).map((_, i) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("tr", {
    key: i,
    className: map[i] ? 'is-mapped' : ''
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("td", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "qs-col"
  }, (0,_components_ui__WEBPACK_IMPORTED_MODULE_4__.colLetter)(i))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("td", null, headers.items[i] ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("strong", null, headers.items[i]) : (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "qs-muted"
  }, /* translators: %s: spreadsheet column letter, e.g. A */(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Column %s', 'quicksheet'), (0,_components_ui__WEBPACK_IMPORTED_MODULE_4__.colLetter)(i)))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("td", {
    className: "qs-maptable__arrow"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Icon, {
    name: "arrow",
    size: 14
  })), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("td", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(ValuePicker, {
    value: map[i] || '',
    fields: fields,
    onChange: v => setMap(m => ({
      ...m,
      [i]: v
    }))
  }))))))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-maptable__foot"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Button, {
    size: "sm",
    icon: "plus",
    onClick: () => setExtraCols(n => n + 1)
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Add column', 'quicksheet')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "qs-muted"
  }, /* translators: %d: number of mapped columns */(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('%d column(s) mapped', 'quicksheet'), mapped))))));
};

/* ------------------------------------------------------------ message apps */
const DiscordConfig = ({
  s,
  setS,
  fields
}) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Field, {
  label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Message', 'quicksheet'),
  htmlFor: "qs-dc-msg",
  help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Markdown is supported. Max 2,000 characters (4,096 inside an embed). @mentions are disabled for safety.', 'quicksheet')
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_TagInput__WEBPACK_IMPORTED_MODULE_7__["default"], {
  id: "qs-dc-msg",
  multiline: true,
  value: s.message,
  onChange: v => setS({
    message: v
  }),
  fields: fields
})), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
  className: "qs-row-2"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Field, {
  label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Bot name (optional)', 'quicksheet'),
  htmlFor: "qs-dc-user",
  help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)("Overrides the webhook's default name.", 'quicksheet')
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
  id: "qs-dc-user",
  className: "qs-input",
  value: s.username,
  onChange: e => setS({
    username: e.target.value
  }),
  placeholder: "Website bot"
})), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Field, {
  label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Format', 'quicksheet')
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Toggle, {
  checked: s.use_embed,
  onChange: v => setS({
    use_embed: v
  }),
  label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Send as rich embed card', 'quicksheet')
}))), s.use_embed && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
  className: "qs-row-2"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Field, {
  label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Embed title', 'quicksheet'),
  htmlFor: "qs-dc-title"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_TagInput__WEBPACK_IMPORTED_MODULE_7__["default"], {
  id: "qs-dc-title",
  value: s.embed_title,
  onChange: v => setS({
    embed_title: v
  }),
  fields: fields
})), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Field, {
  label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Accent color', 'quicksheet'),
  htmlFor: "qs-dc-color"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
  id: "qs-dc-color",
  type: "color",
  className: "qs-color",
  value: s.embed_color,
  onChange: e => setS({
    embed_color: e.target.value
  })
}))));
const WhatsappConfig = ({
  s,
  setS,
  fields
}) => {
  const phoneFields = fields.filter(f => /tel|phone/i.test(f.type + f.key + f.label));
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Field, {
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Send to', 'quicksheet'),
    htmlFor: "qs-wa-to",
    help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Your own number for lead alerts, or a phone field to message the person who submitted. Use international format, e.g. +8801712345678.', 'quicksheet')
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-taginput"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    id: "qs-wa-to",
    className: "qs-input",
    value: s.recipient,
    onChange: e => setS({
      recipient: e.target.value
    }),
    placeholder: "+8801712345678 or {field:phone}"
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_TagInput__WEBPACK_IMPORTED_MODULE_7__.TagSelect, {
    fields: phoneFields.length ? phoneFields : fields,
    onPick: t => setS({
      recipient: t
    }),
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Use a form field', 'quicksheet'),
    smart: false
  }))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Field, {
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Message type', 'quicksheet')
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-segment",
    role: "radiogroup"
  }, [['text', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Text message', 'quicksheet')], ['template', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Approved template', 'quicksheet')]].map(([k, l]) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
    key: k,
    type: "button",
    role: "radio",
    "aria-checked": s.message_type === k,
    className: s.message_type === k ? 'is-active' : '',
    onClick: () => setS({
      message_type: k
    })
  }, l)))), s.message_type === 'text' ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Notice, {
    tone: "info"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('WhatsApp only delivers free-form text if the recipient messaged your business number in the last 24 hours. To message new leads first, use an approved template.', 'quicksheet')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Field, {
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Message', 'quicksheet'),
    htmlFor: "qs-wa-msg"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_TagInput__WEBPACK_IMPORTED_MODULE_7__["default"], {
    id: "qs-wa-msg",
    multiline: true,
    value: s.message,
    onChange: v => setS({
      message: v
    }),
    fields: fields
  }))) : (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-row-2"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Field, {
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Template name', 'quicksheet'),
    htmlFor: "qs-wa-tpl",
    help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Exactly as approved in WhatsApp Manager.', 'quicksheet')
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    id: "qs-wa-tpl",
    className: "qs-input qs-input--mono",
    value: s.template_name,
    onChange: e => setS({
      template_name: e.target.value
    }),
    placeholder: "new_lead_alert"
  })), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Field, {
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Language code', 'quicksheet'),
    htmlFor: "qs-wa-lang"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    id: "qs-wa-lang",
    className: "qs-input qs-input--mono",
    value: s.template_language,
    onChange: e => setS({
      template_language: e.target.value
    }),
    placeholder: "en_US"
  }))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Field, {
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Body variables', 'quicksheet'),
    help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Values for {{1}}, {{2}} … in your template body, in order.', 'quicksheet')
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-params"
  }, s.template_params.map((p, i) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    key: i,
    className: "qs-params__row"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "qs-col"
  }, `{{${i + 1}}}`), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_TagInput__WEBPACK_IMPORTED_MODULE_7__["default"], {
    value: p,
    fields: fields,
    onChange: v => setS({
      template_params: s.template_params.map((x, j) => j === i ? v : x)
    })
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Button, {
    size: "sm",
    variant: "ghost-danger",
    icon: "x",
    "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Remove variable', 'quicksheet'),
    onClick: () => setS({
      template_params: s.template_params.filter((_, j) => j !== i)
    })
  }))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Button, {
    size: "sm",
    icon: "plus",
    onClick: () => setS({
      template_params: [...s.template_params, '']
    })
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Add variable', 'quicksheet'))))));
};
const FacebookConfig = ({
  s,
  setS,
  fields
}) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Notice, {
  tone: "info"
}, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Posts are public on your Page. Avoid posting personal data such as emails or phone numbers from submissions.', 'quicksheet')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Field, {
  label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Post text', 'quicksheet'),
  htmlFor: "qs-fb-msg"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_TagInput__WEBPACK_IMPORTED_MODULE_7__["default"], {
  id: "qs-fb-msg",
  multiline: true,
  value: s.message,
  onChange: v => setS({
    message: v
  }),
  fields: fields,
  placeholder: "\uD83C\uDF89 Thanks {field:your-name} for joining our community!"
})), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Field, {
  label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Link (optional)', 'quicksheet'),
  htmlFor: "qs-fb-link",
  help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Adds a link preview to the post.', 'quicksheet')
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_TagInput__WEBPACK_IMPORTED_MODULE_7__["default"], {
  id: "qs-fb-link",
  value: s.link,
  onChange: v => setS({
    link: v
  }),
  fields: fields,
  placeholder: "https://example.com/offer"
})));

/* ------------------------------------------------------------ conditions */
const ConditionsCard = ({
  condition,
  setCondition,
  fields,
  step
}) => {
  const c = condition || EMPTY_CONDITION;
  const update = patch => setCondition({
    ...c,
    ...patch
  });
  const rules = c.rules.length ? c.rules : [{
    field: fields[0] ? `{field:${fields[0].key}}` : '',
    operator: 'equals',
    value: ''
  }];
  const setRule = (i, patch) => update({
    rules: rules.map((r, j) => j === i ? {
      ...r,
      ...patch
    } : r)
  });
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Card, {
    step: step,
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Conditions', 'quicksheet'),
    subtitle: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Optional — only run this integration when the submission matches.', 'quicksheet'),
    actions: (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Toggle, {
      checked: c.enabled,
      onChange: v => update({
        enabled: v,
        rules
      }),
      label: c.enabled ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('On', 'quicksheet') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Off', 'quicksheet')
    })
  }, !c.enabled ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", {
    className: "qs-muted"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Runs for every submission.', 'quicksheet')) : (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-inline"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Run when', 'quicksheet')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("select", {
    className: "qs-select qs-select--sm qs-select--auto",
    value: c.match,
    onChange: e => update({
      match: e.target.value
    })
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("option", {
    value: "all"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('all', 'quicksheet')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("option", {
    value: "any"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('any', 'quicksheet'))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('of these rules match:', 'quicksheet'))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-rules"
  }, rules.map((r, i) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-rule",
    key: i
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("select", {
    className: "qs-select",
    value: r.field,
    onChange: e => setRule(i, {
      field: e.target.value
    }),
    "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Field', 'quicksheet')
  }, fields.map(f => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("option", {
    key: f.key,
    value: `{field:${f.key}}`
  }, f.label)), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("option", {
    value: "{page_url}"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Page URL', 'quicksheet')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("option", {
    value: "{user_email}"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Logged-in user email', 'quicksheet'))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("select", {
    className: "qs-select",
    value: r.operator,
    onChange: e => setRule(i, {
      operator: e.target.value
    }),
    "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Operator', 'quicksheet')
  }, OPERATORS.map(([k, l]) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("option", {
    key: k,
    value: k
  }, l))), !['empty', 'not_empty'].includes(r.operator) ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    className: "qs-input",
    value: r.value,
    onChange: e => setRule(i, {
      value: e.target.value
    }),
    placeholder: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Value', 'quicksheet'),
    "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Value', 'quicksheet')
  }) : (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", null), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Button, {
    size: "sm",
    variant: "ghost-danger",
    icon: "x",
    "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Remove rule', 'quicksheet'),
    disabled: rules.length < 2,
    onClick: () => update({
      rules: rules.filter((_, j) => j !== i)
    })
  })))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Button, {
    size: "sm",
    icon: "plus",
    onClick: () => update({
      rules: [...rules, {
        field: rules[0].field,
        operator: 'equals',
        value: ''
      }]
    })
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Add rule', 'quicksheet')))));
};

/* ------------------------------------------------------------ main */
function Editor({
  id
}) {
  const toast = (0,_components_ui__WEBPACK_IMPORTED_MODULE_4__.useToast)();
  const [feed, setFeed] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [google, setGoogle] = useState({
    connected: false
  });
  const [sources, setSources] = useState([]);
  const [apps, setApps] = useState([]);
  const [forms, setForms] = useState({
    loading: false,
    items: []
  });
  const [fields, setFields] = useState({
    loading: false,
    items: []
  });
  const [map, setMap] = useState({});
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [accountModal, setAccountModal] = useState(null);
  const [appSearch, setAppSearch] = useState('');
  const set = useCallback(patch => setFeed(f => ({
    ...f,
    ...(typeof patch === 'function' ? patch(f) : patch)
  })), []);
  const setS = patch => setFeed(f => ({
    ...f,
    settings: {
      ...f.settings,
      ...patch
    }
  }));
  useEffect(() => {
    Promise.all([_api__WEBPACK_IMPORTED_MODULE_2__.api.sources(), _api__WEBPACK_IMPORTED_MODULE_2__.api.actions(), _api__WEBPACK_IMPORTED_MODULE_2__.api.status(), id ? _api__WEBPACK_IMPORTED_MODULE_2__.api.feed(id) : Promise.resolve(null)]).then(([src, acts, st, existing]) => {
      setSources(src);
      setApps(acts);
      setGoogle(st);
      if (existing) {
        setFeed({
          ...EMPTY,
          ...existing,
          settings: {
            ...DEFAULT_SETTINGS[existing.action],
            condition: EMPTY_CONDITION,
            ...existing.settings
          }
        });
        const m = {};
        existing.field_map.forEach(r => {
          m[r.col] = r.value;
        });
        setMap(m);
      } else {
        const firstActive = src.find(s => s.active);
        if (firstActive) set({
          source: firstActive.slug
        });
      }
    }).catch(setError).finally(() => setLoading(false));
  }, [id, set]);
  useEffect(() => {
    if (!feed.source) return;
    const src = sources.find(s => s.slug === feed.source);
    if (src && !src.active) {
      setForms({
        loading: false,
        items: []
      });
      return;
    }
    setForms({
      loading: true,
      items: []
    });
    _api__WEBPACK_IMPORTED_MODULE_2__.api.forms(feed.source).then(items => setForms({
      loading: false,
      items
    })).catch(e => {
      setForms({
        loading: false,
        items: []
      });
      toast((0,_api__WEBPACK_IMPORTED_MODULE_2__.errMsg)(e), 'error');
    });
  }, [feed.source, sources, toast]);
  useEffect(() => {
    if (!feed.source || !feed.form_id) {
      setFields({
        loading: false,
        items: []
      });
      return;
    }
    setFields({
      loading: true,
      items: []
    });
    _api__WEBPACK_IMPORTED_MODULE_2__.api.fields(feed.source, feed.form_id).then(items => setFields({
      loading: false,
      items
    })).catch(() => setFields({
      loading: false,
      items: []
    }));
  }, [feed.source, feed.form_id]);
  const app = apps.find(a => a.slug === feed.action);
  const chooseAction = slug => {
    if (slug === feed.action) return;
    const a = apps.find(x => x.slug === slug);
    set({
      action: slug,
      account_id: a && a.accounts.length ? a.accounts[0].id : 0,
      settings: {
        ...DEFAULT_SETTINGS[slug],
        condition: feed.settings.condition || EMPTY_CONDITION
      }
    });
  };
  const onAccountSaved = account => {
    setApps(list => list.map(a => a.slug === account.service ? {
      ...a,
      connected: true,
      accounts: [account, ...a.accounts]
    } : a));
    set({
      account_id: account.id
    });
    setAccountModal(null);
    toast((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('%s connected', 'quicksheet'), account.name));
  };
  const save = async ({
    andTest = false
  } = {}) => {
    const field_map = Object.entries(map).filter(([, v]) => v && v.trim() !== '').map(([col, value]) => ({
      col: Number(col),
      value
    }));
    let recipient = '';
    if (andTest && feed.action === 'whatsapp' && /\{field:/.test(feed.settings.recipient || '')) {
      // eslint-disable-next-line no-alert
      recipient = window.prompt((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Send the test WhatsApp message to which number? (international format)', 'quicksheet'), '') || '';
      if (!recipient) return;
    }
    setSaving(true);
    try {
      const saved = await _api__WEBPACK_IMPORTED_MODULE_2__.api.saveFeed({
        ...feed,
        field_map
      }, id);
      toast(id ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Integration saved', 'quicksheet') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Integration created', 'quicksheet'));
      if (andTest) {
        setTesting(true);
        try {
          const res = await _api__WEBPACK_IMPORTED_MODULE_2__.api.testFeed(saved.id, recipient ? {
            recipient
          } : {});
          toast(res.message || (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Test sent', 'quicksheet'));
        } catch (e) {
          toast((0,_api__WEBPACK_IMPORTED_MODULE_2__.errMsg)(e), 'error');
        } finally {
          setTesting(false);
        }
      }
      if (!id) (0,_router__WEBPACK_IMPORTED_MODULE_3__.navigate)(`/integrations/${saved.id}`);
    } catch (e) {
      toast((0,_api__WEBPACK_IMPORTED_MODULE_2__.errMsg)(e), 'error');
    } finally {
      setSaving(false);
    }
  };
  if (loading) return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Spinner, {
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Loading…', 'quicksheet')
  });
  if (error) return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Notice, {
    tone: "error"
  }, (0,_api__WEBPACK_IMPORTED_MODULE_2__.errMsg)(error));
  const currentSource = sources.find(s => s.slug === feed.source);
  const filteredApps = apps.filter(a => !appSearch || a.label.toLowerCase().includes(appSearch.toLowerCase()));
  const usesAccounts = app && app.uses_accounts;
  const canSave = feed.form_id && feed.action && (feed.action !== 'google_sheets' || Object.values(map).some(v => v && v.trim()));
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-page qs-editor"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-pagehead"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("a", {
    href: "#/integrations",
    className: "qs-back"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('← Integrations', 'quicksheet')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("h1", null, id ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Edit integration', 'quicksheet') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Create integration', 'quicksheet'))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-pagehead__actions"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Toggle, {
    checked: feed.status,
    onChange: v => set({
      status: v
    }),
    label: feed.status ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Active', 'quicksheet') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Paused', 'quicksheet')
  }))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("ol", {
    className: "qs-stepbar",
    "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Progress', 'quicksheet')
  }, [[(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Trigger', 'quicksheet'), !!feed.form_id], [(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Action', 'quicksheet'), !!feed.action], [(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Configure', 'quicksheet'), !!canSave]].map(([l, done], i) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("li", {
    key: l,
    className: done ? 'is-done' : ''
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", null, done ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Icon, {
    name: "check",
    size: 12
  }) : i + 1), l))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Card, {
    step: "1",
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Trigger', 'quicksheet'),
    subtitle: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('When this form is submitted…', 'quicksheet')
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-tiles"
  }, sources.map(s => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
    type: "button",
    key: s.slug,
    className: `qs-tile ${feed.source === s.slug ? 'is-selected' : ''} ${s.active ? '' : 'is-disabled'}`,
    onClick: () => s.active && feed.source !== s.slug && set({
      source: s.slug,
      form_id: '',
      form_title: ''
    }),
    "aria-pressed": feed.source === s.slug,
    disabled: !s.active
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.SourceLogo, {
    source: s.slug,
    size: 36
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "qs-tile__label"
  }, s.label), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "qs-tile__meta"
  }, s.active ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Active', 'quicksheet') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Not active', 'quicksheet'))))), currentSource && currentSource.active && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Field, {
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Form', 'quicksheet'),
    htmlFor: "qs-form"
  }, forms.loading ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Spinner, null) : forms.items.length === 0 ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", {
    className: "qs-muted"
  }, /* translators: %s: form plugin name */(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('No forms found in %s. Create a form first, then come back.', 'quicksheet'), currentSource.label)) : (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("select", {
    id: "qs-form",
    className: "qs-select",
    value: feed.form_id,
    onChange: e => {
      const f = forms.items.find(x => x.id === e.target.value);
      set({
        form_id: e.target.value,
        form_title: f ? f.title : ''
      });
      setMap({});
    }
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("option", {
    value: ""
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Select a form…', 'quicksheet')), forms.items.map(f => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("option", {
    key: f.id,
    value: f.id
  }, f.title)))), feed.form_id && !fields.loading && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", {
    className: "qs-hint"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Icon, {
    name: "form",
    size: 14
  }), " ", /* translators: %d: number of form fields */(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('%d field(s) detected', 'quicksheet'), fields.items.length))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Card, {
    step: "2",
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Action', 'quicksheet'),
    subtitle: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('…do this.', 'quicksheet'),
    actions: (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "qs-search"
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Icon, {
      name: "search",
      size: 14
    }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
      className: "qs-input qs-input--sm",
      placeholder: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Search apps', 'quicksheet'),
      value: appSearch,
      onChange: e => setAppSearch(e.target.value),
      "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Search apps', 'quicksheet')
    }))
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-appgrid"
  }, filteredApps.map(a => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
    type: "button",
    key: a.slug,
    className: `qs-appcard ${feed.action === a.slug ? 'is-selected' : ''}`,
    onClick: () => chooseAction(a.slug),
    "aria-pressed": feed.action === a.slug
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.SourceLogo, {
    source: a.slug,
    size: 40
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "qs-appcard__label"
  }, a.label), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "qs-appcard__desc"
  }, a.description), a.connected ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "qs-appcard__badge"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Connected', 'quicksheet')) : (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "qs-appcard__badge is-off"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Not connected', 'quicksheet'))))), usesAccounts && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Field, {
    label: /* translators: %s: app name */(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('%s account', 'quicksheet'), app.label),
    htmlFor: "qs-account"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-inline qs-inline--nowrap"
  }, app.accounts.length > 0 ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("select", {
    id: "qs-account",
    className: "qs-select",
    value: feed.account_id,
    onChange: e => set({
      account_id: Number(e.target.value)
    })
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("option", {
    value: 0
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Choose an account…', 'quicksheet')), app.accounts.map(acc => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("option", {
    key: acc.id,
    value: acc.id
  }, acc.name))) : (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "qs-muted"
  }, /* translators: %s: app name */(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('No %s account connected yet.', 'quicksheet'), app.label)), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Button, {
    icon: "plus",
    onClick: () => setAccountModal(app)
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Add account', 'quicksheet'))))), app && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Card, {
    step: "3",
    title: /* translators: %s: app name */(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Configure %s', 'quicksheet'), app.label),
    subtitle: feed.action === 'google_sheets' ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Pick a spreadsheet and map form fields to columns.', 'quicksheet') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Compose the message. Use “Insert field” to add submitted values.', 'quicksheet')
  }, !feed.form_id ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", {
    className: "qs-muted"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Choose a trigger form first.', 'quicksheet')) : (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, feed.action === 'google_sheets' && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(SheetsConfig, {
    feed: feed,
    set: set,
    fields: fields.items,
    google: google,
    map: map,
    setMap: setMap
  }), feed.action === 'discord' && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(DiscordConfig, {
    s: feed.settings,
    setS: setS,
    fields: fields.items
  }), feed.action === 'whatsapp' && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(WhatsappConfig, {
    s: feed.settings,
    setS: setS,
    fields: fields.items
  }), feed.action === 'facebook_page' && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(FacebookConfig, {
    s: feed.settings,
    setS: setS,
    fields: fields.items
  }))), app && feed.form_id && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(ConditionsCard, {
    step: "4",
    condition: feed.settings.condition,
    setCondition: c => setS({
      condition: c
    }),
    fields: fields.items
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Card, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-savebar"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Field, {
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Integration name', 'quicksheet'),
    htmlFor: "qs-name",
    help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Optional — shown in the list and logs.', 'quicksheet')
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    id: "qs-name",
    className: "qs-input",
    value: feed.name,
    placeholder: feed.form_title && app ? `${feed.form_title} → ${app.label}` : 'e.g. Contact leads to WhatsApp',
    onChange: e => set({
      name: e.target.value
    })
  })), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-savebar__actions"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Button, {
    onClick: () => (0,_router__WEBPACK_IMPORTED_MODULE_3__.navigate)('/integrations')
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Cancel', 'quicksheet')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Button, {
    icon: "play",
    loading: testing,
    disabled: saving || !canSave,
    onClick: () => save({
      andTest: true
    })
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Save & send test', 'quicksheet')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Button, {
    variant: "primary",
    icon: "check",
    loading: saving && !testing,
    disabled: !canSave,
    onClick: () => save()
  }, id ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Save changes', 'quicksheet') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Create integration', 'quicksheet'))))), accountModal && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_AccountModal__WEBPACK_IMPORTED_MODULE_6__["default"], {
    app: accountModal,
    onClose: () => setAccountModal(null),
    onSaved: onAccountSaved
  }));
}

/***/ },

/***/ "./src/pages/Integrations.jsx"
/*!************************************!*\
  !*** ./src/pages/Integrations.jsx ***!
  \************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Integrations)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _api__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../api */ "./src/api.js");
/* harmony import */ var _router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../router */ "./src/router.js");
/* harmony import */ var _components_ui__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../components/ui */ "./src/components/ui.jsx");





const {
  useState
} = wp.element;
function Integrations() {
  const toast = (0,_components_ui__WEBPACK_IMPORTED_MODULE_4__.useToast)();
  const [{
    loading,
    data,
    error
  }, reload, setState] = (0,_components_ui__WEBPACK_IMPORTED_MODULE_4__.useAsync)(() => _api__WEBPACK_IMPORTED_MODULE_2__.api.feeds());
  const [confirm, setConfirm] = useState(null);
  const [testing, setTesting] = useState(0);
  const toggle = async (feed, status) => {
    setState(s => ({
      ...s,
      data: s.data.map(f => f.id === feed.id ? {
        ...f,
        status
      } : f)
    }));
    try {
      await _api__WEBPACK_IMPORTED_MODULE_2__.api.toggleFeed(feed.id, status);
      toast(status ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Integration enabled', 'quicksheet') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Integration paused', 'quicksheet'));
    } catch (e) {
      toast((0,_api__WEBPACK_IMPORTED_MODULE_2__.errMsg)(e), 'error');
      reload();
    }
  };
  const test = async feed => {
    let data = {};
    if (feed.action === 'whatsapp' && /\{field:/.test(feed.settings && feed.settings.recipient || '')) {
      // eslint-disable-next-line no-alert
      const recipient = window.prompt((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Send the test WhatsApp message to which number? (international format)', 'quicksheet'), '');
      if (!recipient) return;
      data = {
        recipient
      };
    }
    setTesting(feed.id);
    try {
      const res = await _api__WEBPACK_IMPORTED_MODULE_2__.api.testFeed(feed.id, data);
      toast(res.message || (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Test sent', 'quicksheet'));
    } catch (e) {
      toast((0,_api__WEBPACK_IMPORTED_MODULE_2__.errMsg)(e), 'error');
    } finally {
      setTesting(0);
    }
  };
  if (loading) return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Spinner, {
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Loading integrations…', 'quicksheet')
  });
  if (error) return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Notice, {
    tone: "error"
  }, error.message);
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-page"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-pagehead"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("h1", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Integrations', 'quicksheet')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Each integration runs one action whenever a form is submitted.', 'quicksheet')))), data.length === 0 ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Card, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Empty, {
    icon: "link",
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('No integrations yet', 'quicksheet'),
    action: (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.LinkButton, {
      variant: "primary",
      icon: "plus",
      href: "#/integrations/new"
    }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Create your first integration', 'quicksheet'))
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Send Contact Form 7, WPForms or Elementor submissions to Google Sheets, WhatsApp, Discord or your Facebook Page.', 'quicksheet'))) : (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Card, {
    className: "qs-card--flush"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-table-wrap"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("table", {
    className: "qs-table"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("thead", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("tr", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("th", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Integration', 'quicksheet')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("th", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Trigger', 'quicksheet')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("th", {
    "aria-hidden": "true"
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("th", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Action', 'quicksheet')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("th", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Active', 'quicksheet')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("th", {
    "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Actions', 'quicksheet')
  }))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("tbody", null, data.map(f => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("tr", {
    key: f.id,
    className: f.status ? '' : 'is-muted'
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("td", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("a", {
    className: "qs-table__title",
    href: `#/integrations/${f.id}`
  }, f.name), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "qs-table__sub"
  }, /* translators: %s: relative time, e.g. 5 min ago */(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Updated %s', 'quicksheet'), (0,_components_ui__WEBPACK_IMPORTED_MODULE_4__.timeAgo)(f.updated_at)))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("td", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-inline"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.SourceLogo, {
    source: f.source,
    size: 26
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", null, f.form_title || `#${f.form_id}`), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "qs-table__sub"
  }, f.source_label)))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("td", {
    className: "qs-maptable__arrow"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Icon, {
    name: "arrow",
    size: 14
  })), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("td", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-inline qs-inline--nowrap"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.SourceLogo, {
    source: f.action,
    size: 26
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", null, f.action === 'google_sheets' ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("a", {
    className: "qs-sheetlink",
    href: `https://docs.google.com/spreadsheets/d/${f.spreadsheet_id}/edit`,
    target: "_blank",
    rel: "noopener noreferrer"
  }, f.spreadsheet_name || (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Spreadsheet', 'quicksheet'), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Icon, {
    name: "external",
    size: 12
  })) : (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", null, f.action_label), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "qs-table__sub"
  }, f.action === 'google_sheets' ? /* translators: %s: sheet tab name */(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Tab: %s', 'quicksheet'), f.sheet_name) : f.account_name || (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Account missing', 'quicksheet'))))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("td", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Toggle, {
    checked: f.status,
    onChange: v => toggle(f, v),
    ariaLabel: /* translators: %s: integration name */(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Activate %s', 'quicksheet'), f.name)
  })), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("td", {
    className: "qs-table__actions"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Button, {
    size: "sm",
    icon: "play",
    loading: testing === f.id,
    onClick: () => test(f),
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Send test data', 'quicksheet')
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Test', 'quicksheet')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Button, {
    size: "sm",
    icon: "edit",
    onClick: () => (0,_router__WEBPACK_IMPORTED_MODULE_3__.navigate)(`/integrations/${f.id}`),
    "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Edit', 'quicksheet')
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Button, {
    size: "sm",
    variant: "ghost-danger",
    icon: "trash",
    onClick: () => setConfirm(f),
    "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Delete', 'quicksheet')
  })))))))), confirm && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_4__.Confirm, {
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Delete integration?', 'quicksheet'),
    onCancel: () => setConfirm(null),
    onConfirm: async () => {
      try {
        await _api__WEBPACK_IMPORTED_MODULE_2__.api.deleteFeed(confirm.id);
        toast((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Integration deleted', 'quicksheet'));
        setConfirm(null);
        reload();
      } catch (e) {
        toast((0,_api__WEBPACK_IMPORTED_MODULE_2__.errMsg)(e), 'error');
      }
    }
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("strong", null, confirm.name), " ", (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('will stop running. Data already sent is not affected.', 'quicksheet'))));
}

/***/ },

/***/ "./src/pages/Logs.jsx"
/*!****************************!*\
  !*** ./src/pages/Logs.jsx ***!
  \****************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Logs)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _api__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../api */ "./src/api.js");
/* harmony import */ var _components_ui__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../components/ui */ "./src/components/ui.jsx");




const {
  useState,
  Fragment
} = wp.element;

/** Flatten nested payloads (WhatsApp/Discord/Facebook) into readable key → value pairs. */
const flatten = (obj, prefix = '') => Object.entries(obj).reduce((acc, [k, v]) => {
  const key = prefix ? `${prefix}.${k}` : k;
  if (v && typeof v === 'object') return acc.concat(flatten(v, key));
  return acc.concat([[key, v]]);
}, []);
const PayloadView = ({
  data
}) => {
  if (Array.isArray(data)) {
    return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "qs-rowdata"
    }, data.map((v, i) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      key: i,
      className: "qs-rowdata__cell"
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
      className: "qs-col"
    }, (0,_components_ui__WEBPACK_IMPORTED_MODULE_3__.colLetter)(i)), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
      className: v === '' ? 'qs-muted' : ''
    }, v === '' ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('empty', 'quicksheet') : String(v)))));
  }
  const rows = flatten(data || {}).filter(([k]) => !/^(messaging_product|recipient_type|allowed_mentions|preview_url)/.test(k) && !k.endsWith('preview_url'));
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("dl", {
    className: "qs-payload"
  }, rows.map(([k, v]) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    key: k
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("dt", null, k), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("dd", null, String(v)))));
};
const FILTERS = [['', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('All', 'quicksheet')], ['success', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Sent', 'quicksheet')], ['failed', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Failed', 'quicksheet')], ['pending', (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Retrying', 'quicksheet')]];
function Logs() {
  const toast = (0,_components_ui__WEBPACK_IMPORTED_MODULE_3__.useToast)();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(0);
  const [busy, setBusy] = useState(0);
  const [confirmClear, setConfirmClear] = useState(false);
  const [retryingAll, setRetryingAll] = useState(false);
  const [{
    loading,
    data,
    error
  }, reload] = (0,_components_ui__WEBPACK_IMPORTED_MODULE_3__.useAsync)(() => _api__WEBPACK_IMPORTED_MODULE_2__.api.logs({
    status,
    page,
    per_page: 20
  }), [status, page]);
  const retry = async log => {
    setBusy(log.id);
    try {
      const res = await _api__WEBPACK_IMPORTED_MODULE_2__.api.retryLog(log.id);
      // The server returns the app-specific result (e.g. "Message posted to Discord …").
      toast(res.message || (res.status === 'success' ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Sent', 'quicksheet') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Retry failed', 'quicksheet')), res.status === 'success' ? 'success' : 'error');
    } catch (e) {
      toast((0,_api__WEBPACK_IMPORTED_MODULE_2__.errMsg)(e), 'error');
    } finally {
      setBusy(0);
      reload();
    }
  };
  const retryAll = async () => {
    setRetryingAll(true);
    try {
      const r = await _api__WEBPACK_IMPORTED_MODULE_2__.api.retryFailed();
      toast(/* translators: 1: number sent, 2: number still failing */(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('%1$d sent, %2$d still failing', 'quicksheet'), r.success, r.failed), r.failed ? 'error' : 'success');
    } catch (e) {
      toast((0,_api__WEBPACK_IMPORTED_MODULE_2__.errMsg)(e), 'error');
    } finally {
      setRetryingAll(false);
      reload();
    }
  };
  const remove = async log => {
    try {
      await _api__WEBPACK_IMPORTED_MODULE_2__.api.deleteLog(log.id);
      reload();
    } catch (e) {
      toast((0,_api__WEBPACK_IMPORTED_MODULE_2__.errMsg)(e), 'error');
    }
  };
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-page"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-pagehead"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("h1", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Submission logs', 'quicksheet')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)("Every delivery attempt to every app. Failed entries are kept until they're sent, so no lead gets lost.", 'quicksheet'))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-pagehead__actions"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.Button, {
    icon: "retry",
    loading: retryingAll,
    onClick: retryAll
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Retry all failed', 'quicksheet')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.Button, {
    variant: "ghost-danger",
    icon: "trash",
    onClick: () => setConfirmClear(true)
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Clear logs', 'quicksheet')))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-filters",
    role: "tablist"
  }, FILTERS.map(([k, l]) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
    key: k,
    type: "button",
    role: "tab",
    "aria-selected": status === k,
    className: status === k ? 'is-active' : '',
    onClick: () => {
      setStatus(k);
      setPage(1);
    }
  }, l))), error && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.Notice, {
    tone: "error"
  }, error.message), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.Card, {
    className: "qs-card--flush"
  }, loading && !data ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.Spinner, {
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Loading logs…', 'quicksheet')
  }) : !data || data.items.length === 0 ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.Empty, {
    icon: "clock",
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Nothing here yet', 'quicksheet')
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Submissions from connected forms will appear here.', 'quicksheet')) : (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-table-wrap"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("table", {
    className: "qs-table qs-logtable"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("thead", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("tr", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("th", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Status', 'quicksheet')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("th", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Integration', 'quicksheet')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("th", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Details', 'quicksheet')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("th", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Attempts', 'quicksheet')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("th", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Time', 'quicksheet')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("th", {
    "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Actions', 'quicksheet')
  }))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("tbody", null, data.items.map(l => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(Fragment, {
    key: l.id
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("tr", {
    className: open === l.id ? 'is-open' : ''
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("td", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.StatusPill, {
    status: l.status
  })), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("td", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-inline qs-inline--nowrap"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.SourceLogo, {
    source: l.action || 'google_sheets',
    size: 24
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "qs-table__title"
  }, l.feed_name || /* translators: %d: integration ID */(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Integration #%d', 'quicksheet'), l.feed_id)), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "qs-table__sub"
  }, "#", l.id)))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("td", {
    className: "qs-logtable__msg"
  }, l.message), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("td", null, l.attempts), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("td", {
    title: l.created_at
  }, (0,_components_ui__WEBPACK_IMPORTED_MODULE_3__.timeAgo)(l.created_at)), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("td", {
    className: "qs-table__actions"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.Button, {
    size: "sm",
    icon: "eye",
    onClick: () => setOpen(open === l.id ? 0 : l.id),
    "aria-expanded": open === l.id
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Data', 'quicksheet')), l.status !== 'success' && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.Button, {
    size: "sm",
    variant: "primary",
    icon: "retry",
    loading: busy === l.id,
    onClick: () => retry(l)
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Retry', 'quicksheet')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.Button, {
    size: "sm",
    variant: "ghost-danger",
    icon: "trash",
    onClick: () => remove(l),
    "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Delete log', 'quicksheet')
  }))), open === l.id && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("tr", {
    className: "qs-logtable__detail"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("td", {
    colSpan: 6
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(PayloadView, {
    data: l.row_data
  }))))))))), data && data.pages > 1 && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-pager"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.Button, {
    size: "sm",
    disabled: page <= 1,
    onClick: () => setPage(page - 1)
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Previous', 'quicksheet')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", null, /* translators: 1: current page, 2: total pages, 3: total entries */(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Page %1$d of %2$d · %3$d entries', 'quicksheet'), page, data.pages, data.total)), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.Button, {
    size: "sm",
    disabled: page >= data.pages,
    onClick: () => setPage(page + 1)
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Next', 'quicksheet'))), confirmClear && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.Confirm, {
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Clear logs?', 'quicksheet'),
    confirmLabel: status ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Clear filtered logs', 'quicksheet') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Clear all logs', 'quicksheet'),
    onCancel: () => setConfirmClear(false),
    onConfirm: async () => {
      try {
        await _api__WEBPACK_IMPORTED_MODULE_2__.api.clearLogs(status);
        setPage(1);
        reload();
        toast((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Logs cleared', 'quicksheet'));
      } catch (e) {
        toast((0,_api__WEBPACK_IMPORTED_MODULE_2__.errMsg)(e), 'error');
      } finally {
        setConfirmClear(false);
      }
    }
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, status ? /* translators: %s: log status filter, e.g. Failed */(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('All "%s" log entries will be removed. Failed rows that were never sent can\'t be retried after this.', 'quicksheet'), FILTERS.find(f => f[0] === status)[1]) : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)("All log entries will be removed. Failed rows that were never sent can't be retried after this.", 'quicksheet'))));
}

/***/ },

/***/ "./src/pages/Settings.jsx"
/*!********************************!*\
  !*** ./src/pages/Settings.jsx ***!
  \********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Settings)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _api__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../api */ "./src/api.js");
/* harmony import */ var _components_ui__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../components/ui */ "./src/components/ui.jsx");




const {
  useState
} = wp.element;
const General = () => {
  const toast = (0,_components_ui__WEBPACK_IMPORTED_MODULE_3__.useToast)();
  const [{
    loading,
    data,
    error
  },, setState] = (0,_components_ui__WEBPACK_IMPORTED_MODULE_3__.useAsync)(() => _api__WEBPACK_IMPORTED_MODULE_2__.api.settings());
  const [saving, setSaving] = useState(false);
  if (error) return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.Card, {
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('General', 'quicksheet')
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.Notice, {
    tone: "error"
  }, (0,_api__WEBPACK_IMPORTED_MODULE_2__.errMsg)(error)));
  if (loading || !data) return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.Card, {
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('General', 'quicksheet')
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.Spinner, null));
  const set = patch => setState(s => ({
    ...s,
    data: {
      ...s.data,
      ...patch
    }
  }));
  const save = async () => {
    setSaving(true);
    try {
      const res = await _api__WEBPACK_IMPORTED_MODULE_2__.api.saveSettings(data);
      setState({
        loading: false,
        data: res,
        error: null
      });
      toast((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Settings saved', 'quicksheet'));
    } catch (e) {
      toast((0,_api__WEBPACK_IMPORTED_MODULE_2__.errMsg)(e), 'error');
    } finally {
      setSaving(false);
    }
  };
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.Card, {
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('General', 'quicksheet'),
    subtitle: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Delivery, retries and formatting', 'quicksheet')
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-settings"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-setting"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("strong", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Automatic retry', 'quicksheet')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('If Google is unreachable, retry failed rows in the background (5, 10, 15… minutes).', 'quicksheet'))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.Toggle, {
    checked: data.auto_retry,
    onChange: v => set({
      auto_retry: v
    }),
    ariaLabel: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Automatic retry', 'quicksheet')
  })), data.auto_retry && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-setting"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("strong", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Maximum retries', 'quicksheet')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('After this many attempts, the row is marked as failed for manual retry.', 'quicksheet'))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    type: "number",
    min: "0",
    max: "10",
    className: "qs-input qs-input--sm",
    value: data.max_retries,
    onChange: e => set({
      max_retries: e.target.value
    })
  })), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-setting"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("strong", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Keep successful logs for', 'quicksheet')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Failed entries are never purged automatically.', 'quicksheet'))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-inline"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    type: "number",
    min: "1",
    max: "365",
    className: "qs-input qs-input--sm",
    value: data.log_retention_days,
    onChange: e => set({
      log_retention_days: e.target.value
    })
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('days', 'quicksheet')))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-setting"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("strong", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Protect against formula injection', 'quicksheet')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Values starting with =, +, - or @ are stored as plain text. Also keeps phone numbers like +8801… intact.', 'quicksheet'))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.Toggle, {
    checked: data.escape_formulas,
    onChange: v => set({
      escape_formulas: v
    }),
    ariaLabel: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Protect against formula injection', 'quicksheet')
  })), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-setting"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("strong", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Date & time format', 'quicksheet')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Used by the {date}, {time} and {datetime} smart tags (PHP date format).', 'quicksheet'))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-inline"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    className: "qs-input qs-input--sm qs-input--mono",
    value: data.date_format,
    onChange: e => set({
      date_format: e.target.value
    }),
    "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Date format', 'quicksheet')
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    className: "qs-input qs-input--sm qs-input--mono",
    value: data.time_format,
    onChange: e => set({
      time_format: e.target.value
    }),
    "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Time format', 'quicksheet')
  })))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-card__footer"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_3__.Button, {
    variant: "primary",
    loading: saving,
    onClick: save
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Save settings', 'quicksheet'))));
};
function Settings() {
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-page"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-pagehead"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("h1", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Settings', 'quicksheet')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Fine-tune delivery, retries and formatting. App accounts live under', 'quicksheet'), " ", (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("a", {
    href: "#/apps"
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Apps', 'quicksheet')), "."))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(General, null));
}

/***/ },

/***/ "./src/router.js"
/*!***********************!*\
  !*** ./src/router.js ***!
  \***********************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   navigate: () => (/* binding */ navigate)
/* harmony export */ });
const navigate = path => {
  window.location.hash = path;
};

/***/ },

/***/ "./src/style.css"
/*!***********************!*\
  !*** ./src/style.css ***!
  \***********************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ },

/***/ "react"
/*!************************!*\
  !*** external "React" ***!
  \************************/
(module) {

module.exports = window["React"];

/***/ },

/***/ "@wordpress/i18n"
/*!******************************!*\
  !*** external ["wp","i18n"] ***!
  \******************************/
(module) {

module.exports = window["wp"]["i18n"];

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	const __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		const cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		const module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			const e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = (module) => {
/******/ 		const getter = module && module.__esModule ?
/******/ 			() => (module['default']) :
/******/ 			() => (module);
/******/ 		__webpack_require__.d(getter, { a: getter });
/******/ 		return getter;
/******/ 	};
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	// define getter/value functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	__webpack_require__.o = (obj, prop) => (Object.hasOwn(obj, prop));
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = (exports) => {
/******/ 		Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ 	
/************************************************************************/
let __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!***********************!*\
  !*** ./src/index.jsx ***!
  \***********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _components_ui__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./components/ui */ "./src/components/ui.jsx");
/* harmony import */ var _pages_Dashboard__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./pages/Dashboard */ "./src/pages/Dashboard.jsx");
/* harmony import */ var _pages_Integrations__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./pages/Integrations */ "./src/pages/Integrations.jsx");
/* harmony import */ var _pages_Apps__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./pages/Apps */ "./src/pages/Apps.jsx");
/* harmony import */ var _pages_Editor__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./pages/Editor */ "./src/pages/Editor.jsx");
/* harmony import */ var _pages_Logs__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./pages/Logs */ "./src/pages/Logs.jsx");
/* harmony import */ var _pages_Settings__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./pages/Settings */ "./src/pages/Settings.jsx");
/* harmony import */ var _style_css__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./style.css */ "./src/style.css");










const {
  useState,
  useEffect,
  render,
  createRoot
} = wp.element;
const parseHash = () => {
  const h = (window.location.hash || '#/').replace(/^#/, '') || '/';
  return h.split('?')[0];
};
const NAV = [{
  path: '/',
  label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Dashboard', 'quicksheet')
}, {
  path: '/integrations',
  label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Integrations', 'quicksheet')
}, {
  path: '/apps',
  label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Apps', 'quicksheet')
}, {
  path: '/logs',
  label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Logs', 'quicksheet')
}, {
  path: '/settings',
  label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Settings', 'quicksheet')
}];

/** Keep the WP sidebar submenu highlight in sync with the hash route. */
const syncWpMenu = route => {
  const items = document.querySelectorAll('#toplevel_page_quicksheet .wp-submenu li');
  items.forEach(li => {
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
  if (route === '/integrations/new') page = (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_pages_Editor__WEBPACK_IMPORTED_MODULE_6__["default"], {
    key: "new"
  });else if (m = route.match(/^\/integrations\/(\d+)$/)) page = (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_pages_Editor__WEBPACK_IMPORTED_MODULE_6__["default"], {
    key: m[1],
    id: parseInt(m[1], 10)
  });else if (route.startsWith('/integrations')) page = (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_pages_Integrations__WEBPACK_IMPORTED_MODULE_4__["default"], null);else if (route.startsWith('/apps')) page = (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_pages_Apps__WEBPACK_IMPORTED_MODULE_5__["default"], null);else if (route.startsWith('/logs')) page = (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_pages_Logs__WEBPACK_IMPORTED_MODULE_7__["default"], null);else if (route.startsWith('/settings')) page = (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_pages_Settings__WEBPACK_IMPORTED_MODULE_8__["default"], null);else page = (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_pages_Dashboard__WEBPACK_IMPORTED_MODULE_3__["default"], null);
  const isActive = p => p === '/' ? route === '/' : route.startsWith(p);
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_2__.ToastProvider, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "qs-app"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("header", {
    className: "qs-topbar"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("a", {
    className: "qs-brand",
    href: "#/"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "qs-brand__mark"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_2__.Icon, {
    name: "sheet",
    size: 18
  })), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "qs-brand__name"
  }, "QuickSheet"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "qs-brand__ver"
  }, "v", window.QSWP.version)), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("nav", {
    className: "qs-nav"
  }, NAV.map(n => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("a", {
    key: n.path,
    href: '#' + n.path,
    className: isActive(n.path) ? 'is-active' : ''
  }, n.label))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("a", {
    className: "qs-btn qs-btn--primary qs-topbar__cta",
    href: "#/integrations/new"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui__WEBPACK_IMPORTED_MODULE_2__.Icon, {
    name: "plus"
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Create integration', 'quicksheet')))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("main", {
    className: "qs-main"
  }, page)));
};
const mount = () => {
  const el = document.getElementById('qswp-app');
  if (!el) return;
  if (createRoot) createRoot(el).render((0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(App, null));else render((0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(App, null), el);
};
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);else mount();
})();

/******/ })()
;
//# sourceMappingURL=admin.js.map