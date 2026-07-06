import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const markdownContent = `
# Olá, eu sou o Samuel Santana.

Sou Desenvolvedor Frontend Sênior com foco em arquiteturas web modernas, escalabilidade e performance. No meu dia a dia, atuo desenvolvendo soluções robustas utilizando **React**, **Angular** e explorando padrões corporativos como Micro-frontends e Module Federation.

Gosto de entender como as coisas funcionam por baixo dos panos, otimizar workflows, testar hardwares de alta performance e até configurar LLMs locais para explorar as capacidades da máquina.

---

## Além do Código

Escrevo e codifico diretamente de Salvador, Bahia. Quando a IDE está fechada, meu foco geralmente se volta para:

*   **Cafés Especiais:** Sou um entusiasta da extração perfeita. Gostos de testar receitas, ajustar a moagem e usar métodos como a Moka ou filtros de metal para tirar as melhores notas de grãos de qualidade.
*   **RPGs e Ação:** O setup também é dedicado a explorar *builds* em *Diablo IV*, *Diablo Immortal* e *Genshin Impact*.
*   **O Supervisor:** Toda essa rotina acontece sob a supervisão rigorosa do meu gato de 11 anos, Guindas (carinhosamente chamado de Greninho ou Gandalf), que é o verdadeiro dono do escritório.

---

## O Propósito deste Espaço

Este blog nasceu como um laboratório pessoal. Aqui documento meus aprendizados em Engenharia de Software, compartilho dicas de setup e hardware, e escrevo sobre tecnologia e estilo de vida de forma autêntica.

Sinta-se à vontade para interagir na área de comentários dos artigos ou conectar-se comigo profissionalmente:

*   [GitHub](https://github.com/)
*   [LinkedIn](https://linkedin.com/in/)
`;

export default function AboutPage() {
  return (
    <article className="prose prose-invert lg:prose-lg mx-auto max-w-3xl px-4 py-12">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdownContent}</ReactMarkdown>
    </article>
  );
}
