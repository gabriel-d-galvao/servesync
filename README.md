# ServeSync

Protótipo de um sistema de pedidos para restaurante, feito com **HTML, CSS e JavaScript puro**.

> 🌱 **Este é o meu primeiro projeto de programação.** Ele nasceu como exercício para aprender a transformar um design em código funcionando. Está aqui exatamente como o construí, sem esconder as limitações, porque o objetivo é mostrar de onde eu parti e para onde estou indo.

## Sobre o projeto

O ServeSync simula o fluxo de um restaurante em quatro frentes:

- **Login e recuperação de senha:** tela de entrada para cliente e para funcionário, mais o passo a passo de "esqueci minha senha" (e-mail → código → nova senha → confirmação).
- **Painel do cliente:** visualização geral e pedidos.
- **Recepção / gerência:** área do funcionário com a gestão de produtos e pedidos.
- **Cozinha:** tela para acompanhar os pedidos recebidos.

## Tecnologias

- HTML
- CSS
- JavaScript (sem frameworks e sem bibliotecas)
- Figma (para desenhar as telas antes de codificar).

## Como rodar

Não precisa instalar nada.

1. Baixe ou clone o repositório.
2. Abra a pasta no VS Code e use a extensão **Live Server** (o projeto já vem configurado para a porta 5501), ou abra o arquivo `login.html` direto no navegador.

## Limitações conhecidas (e por que eu as documento)

Como é meu primeiro projeto, há coisas que **ainda não são reais**, e prefiro deixar isso claro:

- **Não existe servidor nem banco de dados.** Tudo roda no navegador.
- **O login é uma simulação.** Ele apenas guarda uma marca no `localStorage` do navegador; não verifica e-mail nem senha de verdade. Qualquer pessoa consegue alterar isso pelas ferramentas do navegador. Em um sistema real, a autenticação precisa ser feita no servidor.
- **A recuperação de senha é só a interface.** Nenhum e-mail ou código é realmente enviado.
- **Os dados exibidos são exemplos fictícios.**
- A validação dos formulários acontece apenas no navegador, que é fácil de contornar.

## Autor

**Gabriel Diniz Galvão** - estudante de Ciência da Computação
