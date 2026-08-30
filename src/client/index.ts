import React from 'react';
const NS = 'project-scaffold';
const zh = { title: '项目脚手架', description: '从模板快速创建项目', enabled: '启用插件', templateDir: '模板目录' };
const en = { title: 'Project Scaffold', description: 'Create projects from templates', enabled: 'Enable plugin', templateDir: 'Template directory' };
export const inject = ['settingsScope', 'slots', 'locale'];
export function apply(ctx: any) {
  ctx.effect?.(() => ctx.locale?.register?.(NS, { zh, en }), 'dsh-project-scaffold: locale');
  ctx.effect?.(() => { ctx.slots?.inject?.('settings.plugin.item', function* () { yield ctx.slots.register({ name: 'settings.plugin.item', key: NS, locale: NS, inject: () => ({}) }, Card); }); }, 'dsh-project-scaffold: settings');
}
function Card(props: any) {
  const { scope, t } = props;
  const [open, setOpen] = React.useState(false);
  return React.createElement('li', null,
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', cursor: 'pointer' }, onClick: () => setOpen(!open) },
      React.createElement('strong', null, '🚀 ', t('title')),
      React.createElement('span', { style: { fontSize: '12px', color: '#888' } }, open ? '▲' : '▼')),
    open ? React.createElement('div', { style: { padding: '8px 0', borderTop: '1px solid #333' } },
      React.createElement('label', { style: { display: 'flex', gap: '8px', cursor: 'pointer' } },
        React.createElement('input', { type: 'checkbox', checked: scope?.get?.('enabled') ?? true, onChange: (e: any) => scope?.set?.('enabled', e.target.checked) }), t('enabled'))) : null);
}
