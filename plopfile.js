module.exports = function (plop) {
    // 定义一个组件生成器
    plop.setGenerator('component', {
        description: '创建一个新的 React 组件',
        prompts: [
            {
                type: 'input',
                name: 'name',
                message: '请输入组件名称：',
            },
        ],
        actions: [
            {
                type: 'add',
                path: 'components/{{pascalCase name}}/{{pascalCase name}}.tsx',
                templateFile: 'plop-templates/component.hbs',
            },
            {
                type: 'add',
                path: 'components/{{pascalCase name}}/{{pascalCase name}}.module.css',
                templateFile: 'plop-templates/styles.hbs',
            },
        ],
    });
};