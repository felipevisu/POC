Tenho uma situação no trabalho que é a seguinte: estamos migrando um software legado, é um software em java com struts. A migração é para uma arquitetura moderna backend e frontend, como a antiga é struts não tem endpoint. Preciso constantemente fazer um trace dos dados, de como sai do banco de dados, ou vem de algum serviço externo via API, até quando é renderizado na tela. Mas esse flow as vezes é longo, muitas transformaçõs, alta complexidade ciclomatica, muitas ramificações.

Gostaria de transformar isso de forma visual, um grafo que mostre o fluxo dos dados, como um AST com os nodos apontando para arquivos e funções nesse fluxo, então precisava de um serviço que fizesse este trace, e gerasse um elemento visual em HTML para eu poder entender.

Liste para mim as opções que eu tenho. Como poderiamos fazer uma SKILL que fizesse este papel?

Não precisa gerar tudo de uma vez, de todo o sitema, mas eu poderia especificar uma URL do site, e a partir dali é feito o trace até o banco, ou entrypoint.

Me proponha um rascunho, tecnologias, e como poderiamos fazer isto