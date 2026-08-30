import React from 'react';
import { createSettingsCard } from '@deepseek-ai/dsh-settings';

export default createSettingsCard({
  title: 'project-scaffold',
  description: '项目脚手架',
  config: [
    { key: 'enabled', type: 'boolean', label: '启用插件', default: true },
    { key: 'templateDir', type: 'string', label: '模板目录', default: '~/.dsh/templates' },
  ],
});
