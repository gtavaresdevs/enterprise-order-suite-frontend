# Regras de Negócio — order-ui (Operação de Restaurante)

## Como ler este documento

Este documento reúne as regras de negócio de **todas** as áreas do sistema, cobrindo tanto o que já está **implementado** (Fases 0-9 da reestruturação para operação de restaurante) quanto o que já foi **decidido em especificação, mas ainda não construído** (Fases 10-11: comandas, atendimento por garçom, polimento visual). Ele nasce de uma auditoria cruzada entre as duas especificações já existentes do projeto e o código-fonte real, e serve de referência única para o próximo trabalho de correção/ajuste do sistema.

Cada regra recebe um status:

| Status | Significado |
|---|---|
| ✅ **Implementado** | Regra real, funcionando no código hoje. |
| 🟡 **Parcialmente implementado** | Parte da regra existe, parte não. |
| ⏳ **Planejado (não implementado)** | Decidido em especificação, mas sem nenhum código ainda (majoritariamente itens da Fase 10/11). |
| 🔴 **Diverge do código atual** | Existe uma regra (em especificação ou como invariante implícita) mas o código contraria ou não a garante. **Esta categoria é a prioridade da próxima etapa de correção.** |
| 🆕 **[NOVO]** | Regra proposta nesta auditoria a partir de julgamento de domínio (restaurante + mercado brasileiro), sem decisão prévia em nenhuma especificação. **Precisa da sua confirmação** antes de ser tratada como definitiva. |

Escopo coberto: Fases 0-9 (já construídas) e Fases 10-11 (planejadas), do processo de reestruturação para operação de restaurante. As duas especificações-fonte são `2026-09-09-restaurant-ops-redesign-design.md` e `2026-09-15-core-package-br-i18n-ux-design.md`.

---

## 1. Pedidos & Canais

1. Um pedido tem exatamente um canal: `Online`, `Dine-in` (mesa) ou `Phone` (telefone). Online = autoatendimento do cliente pela Vitrine; Dine-in = vinculado a uma mesa; Phone = registrado por um atendente. ✅ **Implementado.**
2. A equipe (ação "Novo Pedido" na tela de Pedidos) só pode criar pedidos `Phone` ou `Dine-in`, nunca `Online` — pedidos Online são exclusivamente autoatendimento pela Vitrine. ✅ **Implementado.**
3. Pedidos `Dine-in` precisam referenciar uma `Mesa` real; pedidos `Phone` precisam informar um tipo de atendimento (`Retirada`/`Entrega`); pedidos `Online` sempre carregam o tipo de atendimento. ✅ **Implementado.**
4. Um pedido `Phone` + `Entrega` exige a seleção de uma zona de entrega ativa; a opção Entrega só é oferecida quando existe ao menos uma zona ativa. ✅ **Implementado.**
5. O ID do pedido é gerado pelo servidor, prefixado por canal (`DEL-`/`DIN-`/`PHN-`) + ano + sufixo aleatório; o cliente nunca informa o ID. ✅ **Implementado.** (Detalhe cosmético: pedidos `Online` recebem o prefixo `DEL` mesmo quando o atendimento é Retirada — inconsistência de nomenclatura, não um bug funcional.)
6. 🆕 **[NOVO]** O total do pedido deveria ser a soma autoritativa dos preços reais do cardápio, imutável após a criação, exceto por edição dos itens antes do envio. 🔴 **Diverge do código atual**: o modal de criação de pedido (`CreateOrderModal`) permite que o atendente digite livremente nome/quantidade/preço do item, sem nenhuma referência ao cardápio real — não existe validação de preço contra o catálogo para pedidos `Phone`/`Dine-in` criados pela equipe.

### Ciclo de vida do status

7. `OrderStatus` é um enum de 5 valores: `Novo → Em preparo → Pronto → Concluído`, com `Cancelado` alcançável a partir de qualquer estado não-terminal. ✅ **Implementado estruturalmente**, mas 🔴 **nenhuma transição indevida é bloqueada no código** — a função de atualização de status aceita qualquer valor incondicionalmente, então nada impede voltar um pedido `Concluído` para `Novo`, ou pular direto de `Novo` para `Concluído`. A própria interface da Cozinha (KDS) assume progressão linear, mas o backend simulado não garante esse invariante.
8. 🆕 **[NOVO]** Um pedido `Cancelado` deveria ser imutável (sem novas trocas de status, sem reabertura). 🔴 **Diverge do código atual** — não existe essa trava (hoje é seguro apenas porque nenhuma tela reabre um pedido cancelado).
9. Cancelar é uma troca de status (`Cancelado`), nunca uma exclusão definitiva — o histórico do pedido é preservado para auditoria/relatórios. ✅ **Implementado.**
10. A Cozinha (KDS) só exibe pedidos em `Novo`, `Em preparo` ou `Pronto` — pedidos `Concluído` e `Cancelado` somem imediatamente da tela da cozinha. ✅ **Implementado.**
11. A Cozinha só avança um pedido um passo por vez, via um único botão de ação principal por comanda de cozinha — não existe "pular etapa" nem "devolver etapa". ✅ **Implementado como regra de interface** (não é garantido na camada de dados — ver item 7).
12. 🆕 **[NOVO]** O significado de "Pronto" deveria depender do tipo de atendimento: para Entrega, "pronto para o entregador retirar"; para Retirada, "pronto para o cliente retirar"; para Dine-in, "pronto para servir na mesa". ⏳ **Planejado (não implementado)** — hoje existe um único rótulo genérico "Pronto" para qualquer combinação de canal/atendimento.
13. 🆕 **[NOVO]** Um pedido `Concluído` deveria ser somente leitura (sem novas edições de itens, dados do cliente ou pagamento). 🔴 **Diverge do código atual** — não existe trava em nível de campo (seguro hoje apenas por ausência de qualquer caminho de interface que permita a edição).

### Status de pagamento & método (no nível do Pedido)

14. `PaymentStatus` (`Pago`/`Pendente`/`PayLater`) é distinto de `OrderStatus` — um pedido Dine-in ou Retirada pago em `Cash`/`PayLater` pode estar `Concluído` do ponto de vista da cozinha enquanto o pagamento é coletado presencialmente ao final. ✅ **Implementado.**
15. 🆕 **[NOVO]** Marcar o pagamento como "recebido" deveria ser implícito ao avançar o pedido para `Concluído`, não uma tela separada (conforme a especificação de método de pagamento). 🔴 **Diverge do código atual**: o `CreateOrderModal` fixa `paymentStatus` como `"PayLater"` para **todo** pedido criado pela equipe, independentemente do método de pagamento escolhido — isso contraria a própria regra da especificação ("PayLater para Cash, Pago para os demais"), que o fluxo de checkout da Vitrine (`CheckoutFlow`) implementa corretamente. **Este é um bug real, de alta confiança.**
16. Um pagamento em `Cash` (dinheiro) pode opcionalmente registrar `changeFor` (troco). ✅ **Implementado.**
17. Um pagamento em `Card` (cartão) precisa informar o `cardType` (Crédito/Débito) antes do envio. ✅ **Implementado.**

### Criação do pedido

18. 🆕 **[NOVO]** Um pedido recém-criado deveria sempre iniciar com `status: "Novo"` — o status não deveria ser selecionável pelo atendente no momento da criação. 🔴 **Diverge do código atual**: o `CreateOrderModal` expõe um seletor de status completo (incluindo `Cancelado`) já na criação, permitindo pular totalmente a fila da cozinha. Provavelmente resquício de uma funcionalidade antiga de "edição rápida".

## 2. Acompanhamento de Pedido (público, sem login)

19. Um cliente pode consultar o status ao vivo do pedido sem fazer login, informando o ID do pedido + o telefone usado no checkout (comparação tolerante/normalizada). ✅ **Implementado.**
20. A tela de acompanhamento consulta o status periodicamente (sem push/WebSocket), apenas enquanto a tela está montada, no mesmo intervalo usado pela Cozinha. ✅ **Implementado.**
21. 🆕 **[NOVO / contraria decisão já tomada em especificação]** O texto da linha do tempo de status deveria depender do tipo de atendimento (rótulos diferentes para Entrega/Retirada/Dine-in, conforme a especificação do pacote Core). 🔴 **Diverge do código atual** — hoje existe um único conjunto genérico de rótulos para qualquer pedido; os rótulos específicos por atendimento da especificação nunca foram implementados.
22. Um pedido cancelado mostra um estado visual distinto, não uma posição na linha do tempo. ✅ **Implementado.**
23. **[Lacuna já conhecida, citada no roteiro do projeto]** A consulta pública busca a lista inteira de pedidos no lado do cliente (navegador) e filtra localmente, em vez de fazer uma busca já filtrada no servidor. Aceitável enquanto o backend for simulado; **um backend real precisa expor uma busca já filtrada** (por ID+telefone), não enviar a lista inteira de pedidos para uma rota pública sem autenticação.
24. 🆕 **[NOVO, parcialmente superado]** `Order.etaMinutes` deveria ser um retrato ("snapshot") tirado no momento da criação do pedido (para que uma mudança posterior na configuração de zonas não altere retroativamente a promessa de um pedido já em andamento). 🟡 **Parcialmente implementado**: o `etaMinutes` da própria zona é corretamente registrado no momento da criação, mas o campo mais completo da especificação (`estimatedDeliveryMinutes` = tempo médio de preparo + tempo médio de entrega) não existe — nenhum tempo médio de preparo é capturado em lugar nenhum.

## 3. Cardápio & Estoque

25. `features/menu` é a única fonte de verdade para itens do cardápio — nenhuma outra área mantém uma cópia própria dos dados. ✅ **Implementado.**
26. Um item de cardápio marcado como indisponível (`available === false`) nunca deve aparecer em telas voltadas ao cliente. ✅ **Implementado no Cardápio da Mesa (Table-Menu)**; **a filtragem própria da Vitrine não foi confirmada** — a Vitrine não possui filtro visível de disponibilidade e parece depender de uma filtragem anterior que não existe. Provável divergência a confirmar na etapa de correção.
27. Estoque baixo (`0 < estoque <= 5`) é um aviso, não um bloqueio; somente o botão "86" (marcar indisponível) remove o item da venda. ✅ **Implementado.** 🆕 **[NOVO]**: o estoque chegar a zero deveria automaticamente marcar o item como indisponível? Hoje não acontece — é possível salvar `estoque: 0, disponível: true` sem nenhuma validação.
28. O botão "86" é instantâneo e reversível, uma simples alternância booleana. ✅ **Implementado.**
29. Um item de cardápio pode ser excluído definitivamente, não apenas ocultado. ✅ **Implementado, mas com ressalva [NOVO]**: recomenda-se bloquear a exclusão definitiva de um item que já tenha histórico de pedidos (para evitar referências quebradas), forçando o uso do botão "86" nesse caso.
30. O nome é o único campo obrigatório; preço e estoque assumem silenciosamente o valor 0 quando inválidos. ✅ **Implementado, mas sinalizado como risco [NOVO]**: um erro de digitação no preço pode publicar um item gratuito — recomenda-se exigir preço maior que zero.
31. As categorias do cardápio são uma lista fixa no código, não editável pelo dono do restaurante. 🆕 **[NOVO]**: decidir se categorias editáveis pelo dono pertencem a este pacote (Core) ou ficam para depois.
32. O modelo de dados sugere a existência de um "item avulso, fora do cardápio" (uma linha de pedido referenciando um item que não existe no cardápio, nos dados de exemplo), mas nenhuma tela permite realmente criar essa linha. 🔴 **Diverge / funcionalidade incompleta.**
33. Os cartões de item no painel administrativo do Cardápio exibem o preço com um `$` fixo no código, em vez de usar a formatação de moeda compartilhada — quebra a exibição em Real mesmo com o idioma em Português. 🔴 **Diverge do código atual** (mesma classe de bug já identificada em outras telas, ver item 58).

## 4. Mesas & Comandas

34. Uma `Mesa` hoje é apenas `{id, nome, QR code}` — não existe conceito de ocupação/status. ✅ **Implementado como está hoje**; a adição de `status: "Livre" | "Ocupada"` prevista na especificação do pacote Core é ⏳ **Planejada (não implementada)** — confirmado que não existe nenhuma menção a Comanda ou a status de mesa em nenhum lugar do código.
35. O QR code de cada mesa leva à rota pública `/table-menu?table=<id>`, sem necessidade de login. ✅ **Implementado.**
36. Uma mesa pode ser excluída livremente, sem verificação de pedidos abertos vinculados. ✅ **Implementado** (sem problema hoje, pois nada vincula Pedido→Mesa de forma que a exclusão deixe órfãos); 🆕 **[NOVO]**: quando Comandas existirem, excluir uma mesa com comanda aberta deve ser bloqueado ou forçar o fechamento antes.
37. A busca pública de mesa (usada pelo Cardápio da Mesa) reutiliza a mesma fonte de dados do painel administrativo, com um comentário explícito no código alertando que isso não deve ser ligado a um endpoint administrativo real futuramente. 🔴 **Diverge do código atual (documentado, intencional)** — aceitável apenas enquanto tudo for simulado.
38. **As Comandas estão totalmente especificadas na especificação do pacote Core, mas não têm nenhuma implementação** — confirmado via busca no código. ⏳ **Planejado (não implementado).** Carrega consigo o conjunto de sub-regras já definidas: modo **Compartilhado** = uma única comanda para toda a mesa, decidido uma vez no momento de sentar e não alterável durante o atendimento; modo **Individual** = uma comanda por convidado nomeado, nunca editável pelo próprio cliente; o autoatendimento em `/table-menu` só funciona com uma comanda Aberta e Compartilhada; os botões "Chamar garçom"/"Pedir a conta" publicam no mural de notificações existente; fechar uma comanda reutiliza o seletor de pagamento PIX/Cartão/Dinheiro e devolve a mesa ao status Livre quando todas as suas comandas estiverem fechadas.

## 5. Método de Pagamento

39. Todos os métodos de pagamento deste pacote são presenciais/simulados — nenhum gateway real é acionado pelo sistema; o PIX é um fluxo simulado de QR code/copia-e-cola que se autoconfirma. ✅ **Implementado.**
40. Escolher Cartão exige a subseleção obrigatória de Crédito/Débito; nenhum dado de cartão é coletado no aplicativo. ✅ **Implementado.**
41. Escolher Dinheiro exibe um campo opcional "Troco para quanto?". ✅ **Implementado.**
42. Um único componente de seleção de pagamento é usado em todos os contextos (checkout da Vitrine, criação de pedido pela equipe). ✅ **Implementado.**
43. O método de pagamento é um dado real e persistido no Pedido, visível para a equipe. ✅ **Implementado.**
44. Marcar o pagamento como "recebido" é implícito ao avançar o pedido/comanda para Concluído/fechado. ✅ **Implementado para pedidos avulsos; ⏳ Planejado (não implementado) para comandas** (comandas ainda não existem).
45. Dinheiro define `paymentStatus` como `PayLater` por padrão; PIX/Cartão definem `Pago`. ✅ **Implementado no checkout da Vitrine; ver item 15 — o `CreateOrderModal` diverge** (sempre fixa `PayLater`).
46. 🆕 **[NOVO]** O método de pagamento não deveria ser editável após a criação do pedido. Hoje não existe tela que permita essa edição (não totalmente verificado no detalhe do pedido).
47. 🆕 **[NOVO]** Não existe valor mínimo de pedido para Entrega. Negócios de entrega no Brasil comumente definem um — vale decidir antes da etapa de correção.
48. 🆕 **[NOVO]** Não existe regra para reembolso/estorno de pagamento — o que acontece com o `paymentStatus` de um pedido já `Pago` que é cancelado não está definido.

## 6. Zonas de Entrega & Restrição por Atendimento

49. A Vitrine deve oferecer uma escolha explícita entre Retirada e Entrega antes do checkout, não um fluxo fixo somente de entrega. ✅ **Implementado.**
50. Se nenhuma zona de entrega ativa estiver configurada, "Entrega" não deve funcionar como opção. ✅ **Implementado como opção desabilitada com explicação** (a especificação previa que a opção "não aparecesse" — divergência de julgamento de UX entre ocultar vs. desabilitar, funcionalmente equivalente).
51. O dono configura uma lista nomeada de bairros (sem mapa/geolocalização), cada um com taxa e prazo estimado. ✅ **Implementado, mas diverge do modelo exato de campos da especificação**: a especificação previa dois números do dono (tempo médio de preparo + tempo médio de entrega); a implementação real usa um prazo por zona (`etaMinutes`), e a Retirada usa uma constante fixa não configurável de 15 minutos — não existe em nenhum lugar um campo de "tempo médio de preparo" configurável pelo dono.
52. O cliente escolhe o bairro em uma lista suspensa preenchida exatamente com a lista configurada pelo dono (não é texto livre). ✅ **Implementado.**
53. Se o bairro do cliente não for atendido, deveria aparecer uma mensagem clara com a opção "Trocar para Retirada", acionada por uma opção "Meu bairro não está na lista". 🔴 **Diverge do código atual — não implementado**: essa opção/mensagem não existe; um cliente fora de todas as zonas simplesmente não consegue selecionar Entrega, sem explicação.
54. O restante do endereço (rua, número, complemento) é texto livre, salvo no Pedido. ⏳ **Planejado (não implementado)** — não existe nenhum campo de endereço em lugar nenhum; um pedido de entrega hoje carrega apenas o nome do bairro e o telefone. **Lacuna real de alta prioridade.**
55. O prazo estimado é registrado como retrato no momento da criação do pedido. ✅ **Implementado, com nome de campo diferente** (`Order.etaMinutes`, não o `estimatedDeliveryMinutes` proposto na especificação) — funcionalmente correto, diverge apenas no nome.
56. Um número de WhatsApp da loja controla a exibição do link "Continuar no WhatsApp". 🟡 **Parcialmente implementado**: o campo existe e os links do lado da equipe existem; **o link voltado ao cliente na tela de confirmação da Vitrine não existe** — a tela de sucesso só tem "Acompanhar Pedido" e "Voltar ao Cardápio".
57. A taxa de entrega é somada ao total e exibida como item de linha no checkout. ✅ **Implementado.**
58. Bug conhecido: o overlay do carrinho e o rótulo da opção de zona no checkout exibem um `$` fixo em vez de usar a formatação de moeda — quebra a exibição em Real para usuários em Português. 🔴 **Diverge do código atual** — candidato de alta confiança e baixo esforço para a próxima correção.

## 7. Administração (Equipe/Papéis/Log de Auditoria)

59. O ciclo de vida do usuário é convite → ativo → desativado ⇄ reativado, nunca excluído. ✅ **Implementado.**
60. A listagem paginada de usuários não traz o nome — o nome completo só aparece na busca de detalhe de um usuário específico. ✅ **Implementado (restrição documentada do formato de dados).**
61. O log de auditoria e o catálogo de papéis são telas somente leitura, restritas a `SUPER_ADMIN`. ✅ **Implementado.**
62. 🆕 **[NOVO]** Não existe regra de retenção/exportação do log de auditoria — pode ser relevante para responsabilização (LGPD) no futuro. ⏳ **Planejado (não implementado)**, puramente uma lacuna identificada nesta auditoria.
63. 🆕 **[NOVO]** Os nomes de papéis (roles) precisam estar sempre sincronizados entre o tipo fechado do cliente e o que o backend retorna. 🔴 **Diverge do código atual** — risco latente: se o backend adicionar/renomear um papel, o sistema silenciosamente rebaixa o usuário para `USER`, e as telas restritas por papel também não reconhecerão o novo papel.

## 8. Autenticação & Sessão

64. A autenticação é baseada em JWT, decodificado no navegador a partir dos tokens salvos localmente; o usuário é derivado do conteúdo do token, não de uma chamada de perfil. ✅ **Implementado.**
65. A resolução de papel do usuário é defensiva, assumindo `USER` quando nada mais é reconhecido — nunca deixa um usuário sem nenhum papel. ✅ **Implementado.**
66. Proteção de rota em duas camadas: primeiro verifica se existe um token (sem checar validade/expiração), depois verifica se o papel do usuário corresponde ao exigido pela rota (somente nas rotas de Administração), redirecionando para telas diferentes em cada caso. ✅ **Implementado.**
67. As áreas de Administração exigem papéis mínimos diferentes: Equipe exige `ADMIN` ou superior; Papéis e Log de Auditoria exigem apenas `SUPER_ADMIN`. ✅ **Implementado.**
68. 🆕 **[NOVO]** O logout é incondicionalmente do lado do cliente — nenhuma revogação do token acontece no servidor (a chamada real está comentada no código). 🔴 **Diverge do código atual** — um dispositivo perdido não tem seu token realmente invalidado ao "sair" em outro lugar.
69. 🆕 **[NOVO]** O autocadastro (`/register`) existe lado a lado com o convite feito pelo administrador, sem nenhuma regra declarada relacionando os dois caminhos — não está claro se o autocadastro deveria sequer estar acessível em uma ferramenta interna de operação de restaurante. 🔴 **Diverge do código atual (inconsistência, sem avaliação de certo/errado)** — precisa de uma decisão.

## 9. Perfil

70. O perfil é autoatendido, com backend real, em um único endpoint de leitura/escrita — distinto do formato mais restrito usado pela Administração para editar outro usuário. ✅ **Implementado.**
71. O upload de avatar é simulado — nada é realmente salvo, apesar da interface sugerir que sim. 🔴 **Diverge do código atual** — lacuna de integração com o backend real.

## 10. Configurações

72. 🆕 **[NOVO]** As configurações de "Segurança" (2FA, alertas de login, chaves de API, sessões ativas, exclusão de conta) são todas simuladas/sem efeito real — nada realmente acontece ao acioná-las. 🔴 **Diverge do código atual**, e representa um risco diferente dos demais itens simulados do sistema: um controle de segurança que silenciosamente não faz nada, enquanto o dono do restaurante acredita estar protegido, é uma questão de confiança, não apenas uma funcionalidade incompleta.

## 11. Preferências (por dispositivo)

73. As preferências (idioma, tema, fuso horário, moeda, formato de data, tamanho de fonte, modo do menu lateral) são salvas por dispositivo (no navegador), não por conta de usuário nem por loja. ✅ **Implementado como escopo por dispositivo** — sinalizado como arquiteturalmente relevante: dois funcionários compartilhando um mesmo terminal compartilham essas preferências implicitamente; o mesmo funcionário em um segundo dispositivo volta ao padrão. 🆕 **[NOVO]**: idioma/moeda/formato de data deveriam eventualmente ser por conta ou por loja (salvos no servidor)? Recomenda-se adiar até existir um backend real de Preferências, mas vale já decidir o formato-alvo.
74. O idioma padrão prioriza o público brasileiro: idioma do navegador começando com `en` → Inglês; qualquer outro caso (incluindo nenhuma correspondência) → Português (Brasil); uma escolha salva sempre prevalece sobre a detecção automática. ✅ **Implementado.**
75. Valores de idioma salvos anteriormente e não mais reconhecidos se autocorrigem para a opção atual mais próxima, em vez de quebrar a interface. ✅ **Implementado.**
76. Os padrões de moeda/formato de data seguem o idioma resolvido, mas continuam podendo ser ajustados independentemente depois. ✅ **Implementado.**

## 12. Painel Inicial (Home)

77. O conceito de "hoje" no resumo do painel é a data mais recente presente nos dados de pedidos simulados, não a data real do calendário — uma acomodação deliberada aos dados de exemplo (que têm datas fixas no passado). ✅ **Implementado, mas deve voltar a usar a data real do calendário quando um backend real existir** — esta é uma regra válida apenas para dados simulados, não para produção.
78. O resumo de "hoje" conta pedidos cuja data de criação é igual à data de referência; receita e ticket médio adicionalmente excluem pedidos Cancelados ("pedidos faturáveis"). ✅ **Implementado.**
79. O contador de pedidos represados na cozinha é um conceito de "agora", não de "hoje" — conta todo pedido em `Novo`/`Em preparo`, de qualquer data. ✅ **Implementado — divergência intencional** em relação aos demais indicadores do mesmo painel, e é o comportamento correto para operação de restaurante (uma fila represada não se importa com o dia em que o pedido foi feito); sinalizado explicitamente aqui para que uma futura padronização não "corrija" isso por engano.
80. Alerta de estoque baixo: item disponível E com `0 < estoque <= limite`; itens zerados (já marcados indisponíveis via "86") são excluídos do alerta. ✅ **Implementado**, com um único limite compartilhado (sem duplicação).
81. Quatro ações rápidas: Novo Pedido, Abrir Cozinha, Ver Cardápio, Copiar Link de Pedidos. ✅ **Implementado.** 🆕 **[NOVO]**: "Copiar Link de Pedidos" copia um caminho relativo (`/storefront`), não uma URL completa — um dono compartilhando isso via WhatsApp/Instagram precisa de uma URL completa. Provável lacuna real.

## 13. Analytics (Indicadores)

82. Definições dos indicadores: Receita Total = soma dos totais de pedidos não-Cancelados (todo o período); Total de Pedidos = contagem de TODOS os pedidos, incluindo Cancelados; Ticket Médio = Receita / número de pedidos faturáveis; Taxa de Cancelamento = cancelados / total. ✅ **Implementado.** 🆕 **[NOVO]**: o Total de Pedidos incluir cancelados enquanto os outros três indicadores excluem é uma inconsistência interna — vale decidir se deveria existir um indicador separado de "Cancelados".
83. Receita ao longo do tempo e volume de pedidos por dia são agrupados por data, não por hora (adaptação já documentada na Fase 6, substituindo o "mapa de calor de horários de pico" da especificação original, já que não existe dado de hora no modelo). ✅ **Implementado — diverge apenas na nomenclatura**: o componente/tipo ainda se chama "Heatmap" (mapa de calor), embora exiba barras por dia, não uma grade de horários. Candidato a renomeação, sem impacto funcional.
84. Itens Mais Vendidos: top 5 por quantidade vendida, todo o período, excluindo Cancelados. ✅ **Implementado.**
85. Nenhum indicador ou item mostra variação percentual/tendência (não existe período anterior de referência nos dados simulados). ✅ **Implementado (omissão intencional).**
86. Os valores de moeda dos indicadores de Analytics têm um `$` fixo no código, sem passar pela formatação de moeda/i18n. 🔴 **Diverge do código atual** — contraria tanto a regra de fronteira de apresentação do i18n quanto a exigência explícita de formatação em Real da especificação; um usuário em Português vê `$1234.56` em vez de `R$ 1.234,56`. **Candidato de alta confiança para a próxima correção**, mesma classe de bug do Cardápio/Vitrine/Checkout.

## 14. Notificações

87. A regra da especificação do pacote Core ("uma mudança de status do pedido adiciona uma mensagem simulada 'Mensagem enviada via WhatsApp' ao mural de notificações") **não está implementada**. 🔴 **Diverge do código (a especificação diz que foi construído, o código mostra que não)**: os links reais de WhatsApp (Fase 9) ficam inteiramente dentro das telas de Pedidos e Cozinha, abrindo diretamente o `wa.me` — nenhum deles grava nada no mural de Notificações. Os dois sistemas estão completamente desconectados.
88. Todo o conteúdo de `features/notifications` é conteúdo de demonstração genérica de um sistema B2B anterior à reestruturação para restaurante — "Alertas de Envio", "Pedidos de Compra", "Alertas de Login" — a única área do sistema não tocada por nenhuma das Fases 0-9. 🔴 **Diverge da intenção de toda a iniciativa.** 🆕 **[NOVO, alta prioridade]**: as Notificações deveriam ser reconstruídas com categorias relevantes para o restaurante (mudança de status de pedido, alertas de estoque baixo, "Chamar garçom"/"Pedir a conta", confirmações de envio por WhatsApp) e ligadas a eventos reais do sistema? Isso parece uma lacuna não intencional, não um objetivo explicitamente descartado.
89. 🆕 **[NOVO]** As preferências de notificação (silenciar/categorias) são salvas por uma chamada simulada que descarta o valor ao recarregar a página — diferente de `preferences` (salvo no navegador). Deveria seguir o mesmo padrão de persistência?
90. 🆕 **[NOVO]** As notificações são globais/por instalação, não vinculadas ao usuário autenticado. Um histórico de notificações por usuário é necessário para um restaurante com múltiplos funcionários, ou um mural único compartilhado está correto para uma ferramenta de operador pequeno?

## 15. Internacionalização (i18n)

91. Apenas dois idiomas: `en` (Inglês) e `pt-BR` (Português do Brasil), organizados por área/funcionalidade (15 namespaces). ✅ **Implementado.**
92. O Inglês é o idioma canônico e de reserva — uma chave sem tradução em Português exibe o texto em Inglês, nunca em branco ou a chave crua. ✅ **Implementado.**
93. Resolução do idioma padrão: uma preferência salva sempre prevalece; caso contrário, idioma do navegador começando com `en` → Inglês, senão → Português (Brasil). ✅ **Implementado exatamente como especificado.**
94. Troca em tempo real, sem recarregar a página — mudar o idioma atualiza toda a interface montada imediatamente, tanto em rotas públicas quanto autenticadas. ✅ **Implementado.**
95. O mecanismo antigo de tradução, feito à mão (cobrindo apenas 2 telas, em Francês/Espanhol), foi totalmente removido, não deixado inativo. ✅ **Implementado.**
96. Fronteira de apresentação apenas: a tradução nunca deve alterar valores de domínio/enum armazenados (status do pedido, canal, identificadores de permissão). ✅ **Implementado por convenção** — não verificado ponto a ponto em todas as 15 áreas nesta auditoria.
97. A formatação de moeda em Real e de data no formato DD/MM/AAAA deve se aplicar quando o idioma ativo é Português. **Não verificado nesta auditoria** (o utilitário de formatação não foi lido por nenhuma das frentes de análise) — sinalizar para verificação direta antes de considerar confirmado.

---

## Resumo de prioridades para a próxima etapa de correção

Bugs de alta confiança, baixo esforço, já localizados no código:
- **Item 15**: `CreateOrderModal` sempre define `paymentStatus` como `PayLater`, ignorando o método de pagamento escolhido.
- **Itens 33, 58, 86**: `$` fixo no código em vez da formatação de moeda, em três telas diferentes (Cardápio administrativo, Checkout/carrinho da Vitrine, Analytics) — mesma classe de bug repetida.
- **Item 18**: seletor de status (incluindo "Cancelado") disponível na criação do pedido, pulando a fila da cozinha.

Lacunas reais que precisam de decisão de produto antes de implementar:
- **Item 54**: nenhum campo de endereço de entrega (rua/número/complemento) existe hoje.
- **Item 53**: nenhuma opção de "bairro não atendido" no checkout de entrega.
- **Item 88**: Notificações continuam sendo conteúdo genérico de demonstração, nunca migrado para o domínio de restaurante.
- **Item 56**: falta o link "Continuar no WhatsApp" voltado ao cliente na confirmação de pedido.

Ver o documento `2026-09-16-fluxo-de-dados.md` para a arquitetura de dados por trás de cada uma dessas áreas.
