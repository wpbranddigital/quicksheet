import { __ } from '@wordpress/i18n';

const { useRef } = wp.element;

export const SMART_TAGS = [
	['{all_fields}', __( 'All fields (Label: value)', 'quicksheet' )],
	['{datetime}', __( 'Submission date & time', 'quicksheet' )],
	['{date}', __( 'Submission date', 'quicksheet' )],
	['{time}', __( 'Submission time', 'quicksheet' )],
	['{form_title}', __( 'Form title', 'quicksheet' )],
	['{entry_id}', __( 'Entry ID', 'quicksheet' )],
	['{page_url}', __( 'Page URL', 'quicksheet' )],
	['{ip}', __( 'Visitor IP', 'quicksheet' )],
	['{user_agent}', __( 'Browser / user agent', 'quicksheet' )],
	['{user_email}', __( 'Logged-in user email', 'quicksheet' )],
	['{site_name}', __( 'Site name', 'quicksheet' )],
	['{site_url}', __( 'Site URL', 'quicksheet' )],
];

/** Select that lists form fields + smart tags. */
export const TagSelect = ({ fields, onPick, label, smart = true }) => {
	const defaultLabel = label || __( '+ Insert field', 'quicksheet' );
	return (
		<select
			className="qs-select qs-select--sm qs-tagselect"
			value=""
			onChange={(e) => { if (e.target.value) onPick(e.target.value); }}
			aria-label={__( 'Insert a form field or smart tag', 'quicksheet' )}
		>
			<option value="">{defaultLabel}</option>
			{fields.length > 0 && (
				<optgroup label={__( 'Form fields', 'quicksheet' )}>
					{fields.map((f) => <option key={f.key} value={`{field:${f.key}}`}>{f.label}</option>)}
				</optgroup>
			)}
			{smart && (
				<optgroup label={__( 'Smart tags', 'quicksheet' )}>
					{SMART_TAGS.map(([t, l]) => <option key={t} value={t}>{l}</option>)}
				</optgroup>
			)}
		</select>
	);
};

/** Text input / textarea with a field inserter that drops tags at the cursor. */
export default function TagInput({ value, onChange, fields, multiline, rows = 5, placeholder, id }) {
	const ref = useRef(null);
	const insert = (tag) => {
		const el = ref.current;
		const v = value || '';
		if (!el || typeof el.selectionStart !== 'number') { onChange(v + tag); return; }
		const start = el.selectionStart;
		const end = el.selectionEnd;
		onChange(v.slice(0, start) + tag + v.slice(end));
		requestAnimationFrame(() => { el.focus(); el.selectionStart = el.selectionEnd = start + tag.length; });
	};
	const props = {
		id,
		ref,
		value: value || '',
		placeholder,
		className: `qs-input ${multiline ? 'qs-textarea' : ''}`,
		onChange: (e) => onChange(e.target.value),
	};
	return (
		<div className="qs-taginput">
			{multiline ? <textarea rows={rows} {...props} /> : <input type="text" {...props} />}
			<TagSelect fields={fields} onPick={insert} />
		</div>
	);
}
