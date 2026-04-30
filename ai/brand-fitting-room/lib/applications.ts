export type ApplicationCategory =
  | "Impressos"
  | "Vestuário"
  | "Embalagens"
  | "Sinalização"
  | "Digital"
  | "Premium";

export type Application = {
  id: string;
  name: string;
  category: ApplicationCategory;
  caption: string;
  defaultPrompt: string;
  suggestedRatio?: AspectRatio;
};

export const APPLICATIONS: Application[] = [
  {
    id: "business-card",
    name: "Cartão de Visita",
    category: "Impressos",
    caption: "Papel fosco, mesa de madeira, luz natural.",
    defaultPrompt:
      "Coloque exatamente esta logo em um cartão de visita branco fosco apoiado em ângulo sobre uma mesa de carvalho com textura. Luz natural suave entrando pela janela à esquerda, profundidade de campo rasa, mockup de produto fotorrealista. Preserve as cores, proporções e tipografia da logo exatamente — não redesenhe nem altere as cores.",
    suggestedRatio: "4:3",
  },
  {
    id: "letterhead",
    name: "Papel Timbrado",
    category: "Impressos",
    caption: "Folha A4, caneta tinteiro, vista superior.",
    defaultPrompt:
      "Vista superior em flat-lay de uma folha A4 timbrada em papel creme, com a logo centralizada no topo, ao lado uma caneta tinteiro e uma xícara de café. Luz natural difusa, mockup fotorrealista de papelaria. Preserve as cores, proporções e tipografia da logo exatamente.",
    suggestedRatio: "3:4",
  },
  {
    id: "hang-tag",
    name: "Tag de Etiqueta",
    category: "Impressos",
    caption: "Tag de kraft, barbante, em uma peça.",
    defaultPrompt:
      "Uma tag de papel kraft com a logo impressa em tinta escura, suspensa por barbante natural na gola de um suéter de lã cinza dobrado. Iluminação de estúdio, profundidade de campo rasa, mockup fotorrealista. Preserve as cores, proporções e tipografia da logo exatamente.",
    suggestedRatio: "3:4",
  },
  {
    id: "embroidered-polo",
    name: "Polo Bordada",
    category: "Vestuário",
    caption: "Bordado no peito, piquê azul-marinho.",
    defaultPrompt:
      "Close de uma camisa polo de piquê de algodão azul-marinho, com a logo bordada em pontos elevados no peito esquerdo, com textura visível das linhas. Dobrada cuidadosamente sobre uma superfície de madeira, luz direcional suave. Mockup fotorrealista de bordado. Preserve as cores, proporções e tipografia da logo exatamente — traduza áreas preenchidas em direções de ponto, mas mantenha a forma.",
    suggestedRatio: "1:1",
  },
  {
    id: "screen-print-tee",
    name: "Camiseta Serigrafada",
    category: "Vestuário",
    caption: "Algodão pesado, tinta à base de água.",
    defaultPrompt:
      "Uma camiseta de algodão pesado em tom creme em um cabide de madeira contra uma parede de reboco, com a logo serigrafada em grande no centro do peito, com a leve textura da tinta serigráfica à base de água. Luz natural difusa pela janela. Mockup fotorrealista de vestuário. Preserve as cores, proporções e tipografia da logo exatamente.",
    suggestedRatio: "3:4",
  },
  {
    id: "tote-bag",
    name: "Sacola de Lona",
    category: "Vestuário",
    caption: "Lona pesada, tinta única, sol da tarde.",
    defaultPrompt:
      "Uma sacola de lona crua pesada pendurada em um gancho de latão, com a logo estampada em destaque com uma única cor de tinta no painel frontal. Luz quente de tarde criando sombras suaves no tecido, mockup fotorrealista de produto. Preserve as cores, proporções e tipografia da logo exatamente.",
    suggestedRatio: "3:4",
  },
  {
    id: "shipping-box",
    name: "Caixa de Envio",
    category: "Embalagens",
    caption: "Kraft corrugado, carimbo monocromático.",
    defaultPrompt:
      "Uma caixa de envio de papelão corrugado kraft em piso de concreto, com a logo carimbada em destaque na lateral com a textura imperfeita de um carimbo monocromático. Ângulo em três quartos, iluminação quente de galpão, mockup fotorrealista de embalagem. Preserve as cores, proporções e tipografia da logo exatamente.",
    suggestedRatio: "1:1",
  },
  {
    id: "coffee-cup",
    name: "Copo de Café",
    category: "Embalagens",
    caption: "Copo de viagem com cinta de kraft.",
    defaultPrompt:
      "Um copo de café para viagem com cinta de papelão kraft, com a logo impressa de forma limpa na cinta. Segurado contra um fundo desfocado de cafeteria, luz dourada do fim de tarde, profundidade de campo rasa, mockup fotorrealista de embalagem. Preserve as cores, proporções e tipografia da logo exatamente.",
    suggestedRatio: "9:16",
  },
  {
    id: "product-label",
    name: "Rótulo de Garrafa",
    category: "Embalagens",
    caption: "Vidro âmbar, rótulo de papel, condensação.",
    defaultPrompt:
      "Uma garrafa de vidro âmbar sobre uma superfície de mármore, com um rótulo de papel branco limpo enrolado, exibindo a logo. Leve condensação no vidro, luz suave de estúdio vinda de cima, profundidade de campo rasa, mockup fotorrealista de produto. Preserve as cores, proporções e tipografia da logo exatamente.",
    suggestedRatio: "3:4",
  },
  {
    id: "illuminated-sign",
    name: "Letreiro Iluminado",
    category: "Sinalização",
    caption: "Letreiro 3D iluminado ao entardecer.",
    defaultPrompt:
      "Um letreiro tridimensional iluminado da logo montado em uma fachada de pedra escura ao entardecer. Iluminação interna sutil atravessando as letras, leve halo de luz na pedra, mockup arquitetônico fotorrealista de sinalização. Preserve as cores, proporções e tipografia da logo exatamente.",
    suggestedRatio: "16:9",
  },
  {
    id: "frosted-door",
    name: "Porta de Vidro Jateado",
    category: "Sinalização",
    caption: "Marca gravada em porta de escritório.",
    defaultPrompt:
      "Uma porta de vidro jateado de escritório com a logo gravada de forma limpa na superfície, luz natural interna difundindo pelo vidro, com a silhueta tênue de um espaço de trabalho aberto ao fundo. Mockup arquitetônico fotorrealista. Preserve as cores, proporções e tipografia da logo exatamente.",
    suggestedRatio: "3:4",
  },
  {
    id: "window-decal",
    name: "Adesivo de Vitrine",
    category: "Sinalização",
    caption: "Vinil em vitrine ao nível da rua.",
    defaultPrompt:
      "Uma vitrine de loja com a logo aplicada em vinil adesivo ao nível da rua, reflexos suaves da rua visíveis no vidro, luz interna quente vazando para fora. Mockup fotorrealista urbano de fachada. Preserve as cores, proporções e tipografia da logo exatamente.",
    suggestedRatio: "16:9",
  },
  {
    id: "vehicle-livery",
    name: "Adesivagem de Veículo",
    category: "Sinalização",
    caption: "Adesivagem lateral em van de entrega.",
    defaultPrompt:
      "Uma van de entrega branca limpa estacionada em uma rua urbana, com a logo aplicada como adesivagem em vinil no painel lateral em grande escala. Ângulo em três quartos, luz natural de céu nublado, mockup fotorrealista de veículo comercial. Preserve as cores, proporções e tipografia da logo exatamente.",
    suggestedRatio: "16:9",
  },
  {
    id: "app-icon",
    name: "Ícone de App",
    category: "Digital",
    caption: "Ícone arredondado na tela do celular.",
    defaultPrompt:
      "Tela inicial de um smartphone moderno fotografada de frente, com a logo renderizada como ícone quadrado arredondado entre outros ícones de apps levemente visíveis. A tela tem um leve reflexo. Mockup fotorrealista de dispositivo. Preserve as cores, proporções e tipografia da logo exatamente.",
    suggestedRatio: "9:16",
  },
  {
    id: "browser-hero",
    name: "Hero no Navegador",
    category: "Digital",
    caption: "Laptop aberto exibindo uma página web.",
    defaultPrompt:
      "Um laptop aberto sobre uma mesa de concreto limpa, com a tela exibindo uma página web minimalista com a logo destacada na navegação superior à esquerda. Luz natural suave da janela, leve ângulo, mockup fotorrealista de dispositivo. Preserve as cores, proporções e tipografia da logo exatamente.",
    suggestedRatio: "16:9",
  },
  {
    id: "embossed-leather",
    name: "Couro Relevado",
    category: "Premium",
    caption: "Capa de caderno em alto-relevo seco.",
    defaultPrompt:
      "Uma capa de caderno premium em couro castanho sobre uma superfície de nogueira escura, com a logo gravada em alto-relevo seco no couro, mostrando reentrâncias sutis que captam a luz. Luz lateral rasante revelando o relevo, mockup fotorrealista de produto premium. Traduza a logo em alto-relevo — preserve forma e proporção exatamente.",
    suggestedRatio: "1:1",
  },
  {
    id: "metal-pen",
    name: "Caneta Gravada",
    category: "Premium",
    caption: "Gravação a laser em caneta de metal escovado.",
    defaultPrompt:
      "Macro de uma caneta de aço inoxidável escovado apoiada sobre ardósia, com a logo gravada a laser de forma limpa ao longo do corpo. Luz direcional intensa revelando a textura escovada e o relevo gravado. Mockup fotorrealista de produto premium. Preserve a forma e as proporções da logo exatamente.",
    suggestedRatio: "16:9",
  },
  {
    id: "wax-seal",
    name: "Selo de Cera",
    category: "Premium",
    caption: "Cera vermelha pressionada em envelope.",
    defaultPrompt:
      "Um selo de cera vermelha intensa pressionado em um envelope creme, com a logo em alto-relevo na cera, com bordas e imperfeições naturais de superfície. Vista superior, luz natural suave, mockup fotorrealista de papelaria. Traduza a logo em uma impressão em relevo — preserve forma e proporção exatamente.",
    suggestedRatio: "1:1",
  },
  {
    id: "brushed-aluminum",
    name: "Alumínio Escovado",
    category: "Premium",
    caption: "Placa gravada, luz rasante de estúdio.",
    defaultPrompt:
      "Uma placa de alumínio escovado montada em uma parede de concreto carvão, com a logo gravada limpa na superfície. Luz rasante de estúdio vinda de um lado revela a textura escovada e o relevo gravado. Mockup fotorrealista de placa arquitetônica. Preserve a forma e as proporções da logo exatamente.",
    suggestedRatio: "4:3",
  },
];

export const CATEGORY_ORDER: ApplicationCategory[] = [
  "Impressos",
  "Vestuário",
  "Embalagens",
  "Sinalização",
  "Digital",
  "Premium",
];

export const ASPECT_RATIOS = ["1:1", "4:3", "3:4", "16:9", "9:16"] as const;
export type AspectRatio = (typeof ASPECT_RATIOS)[number];

export const IMAGE_SIZES = ["1K", "2K", "4K"] as const;
export type ImageSize = (typeof IMAGE_SIZES)[number];
