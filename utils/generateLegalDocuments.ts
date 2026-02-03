
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Client, Lawyer, Office } from '../types';

interface DocumentParams {
  client: any;
  lawyer: Lawyer | null;
  office: Office;
}

// Configurações de layout otimizadas para 1 página
const MARGIN_LEFT = 25;
const MARGIN_RIGHT = 25;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297; 
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
const HEADER_HEIGHT = 32; // Reduzido de 40

// Cores do Tema
const COLOR_HEADER_BG = [15, 23, 42];
const COLOR_ACCENT = [249, 115, 22];
const COLOR_SECTION_BG = [241, 245, 249];
const COLOR_SECTION_TEXT = [194, 65, 12];

const setupHeader = (doc: jsPDF, office: Office, lawyer: Lawyer | null) => {
  doc.setFillColor(COLOR_HEADER_BG[0], COLOR_HEADER_BG[1], COLOR_HEADER_BG[2]);
  doc.rect(0, 0, PAGE_WIDTH, HEADER_HEIGHT, 'F');

  // Logo compacta
  if (office.logo_url) {
    try {
      doc.addImage(office.logo_url, 'PNG', MARGIN_LEFT, 8, 30, 12);
    } catch (e) {
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(office.name.toUpperCase(), MARGIN_LEFT, 18);
    }
  } else {
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(office.name.toUpperCase(), MARGIN_LEFT, 18);
  }

  // Dados compactos à direita
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  const lawyerName = lawyer?.name || 'THIAGO MASTRANGELO MARQUES';
  const lawyerOab = lawyer?.oab || '410.047/SP';
  const lawyerEmail = lawyer?.email || 'thiagommarmarquesadv@gmail.com';
  const officeAddr = office.address || 'R: Manoel Sichieri, 1089';
  
  doc.text(officeAddr.toUpperCase(), PAGE_WIDTH - MARGIN_RIGHT, 14, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 200);
  doc.text(`OAB/${lawyerOab} | ${lawyerEmail}`, PAGE_WIDTH - MARGIN_RIGHT, 19, { align: 'right' });
  
  // Linha de acento laranja
  doc.setFillColor(COLOR_ACCENT[0], COLOR_ACCENT[1], COLOR_ACCENT[2]);
  doc.rect(0, HEADER_HEIGHT, PAGE_WIDTH, 1.2, 'F');
};

const drawSectionHeader = (doc: jsPDF, title: string, y: number) => {
  doc.setFillColor(COLOR_SECTION_BG[0], COLOR_SECTION_BG[1], COLOR_SECTION_BG[2]);
  doc.rect(MARGIN_LEFT, y, CONTENT_WIDTH, 6, 'F');
  
  doc.setDrawColor(COLOR_ACCENT[0], COLOR_ACCENT[1], COLOR_ACCENT[2]);
  doc.setLineWidth(0.4);
  doc.line(MARGIN_LEFT, y, MARGIN_LEFT + CONTENT_WIDTH, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(COLOR_SECTION_TEXT[0], COLOR_SECTION_TEXT[1], COLOR_SECTION_TEXT[2]);
  doc.text(title.toUpperCase(), MARGIN_LEFT + 2, y + 4.2);
  
  doc.setTextColor(0, 0, 0);
  return y + 10;
};

const setupFooter = (doc: jsPDF, clientName: string, city: string) => {
  const today = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  
  // Posicionamento do rodapé mais alto para garantir que caiba em 1 página
  const footerStartY = PAGE_HEIGHT - 55;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(`${city}, ${today}.`, MARGIN_LEFT, footerStartY);
  
  // Linha de Assinatura centralizada
  doc.setDrawColor(0);
  doc.setLineWidth(0.4);
  const lineY = footerStartY + 15;
  doc.line(PAGE_WIDTH / 2 - 40, lineY, PAGE_WIDTH / 2 + 40, lineY);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('REQUERENTE', PAGE_WIDTH / 2, lineY + 4, { align: 'center' });
  doc.text(clientName.toUpperCase(), PAGE_WIDTH / 2, lineY + 8, { align: 'center' });
};

const addJustifiedText = (doc: jsPDF, text: string, x: number, y: number, width: number, fontSize: number = 10): number => {
  doc.setFontSize(fontSize);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  const lines = doc.splitTextToSize(text, width);
  doc.text(lines, x, y, { align: 'justify', maxWidth: width });
  // Espaçamento entre parágrafos reduzido para otimização
  return y + (lines.length * 5) + 6;
};

export const generateProcuracaoPDF = async ({ client, lawyer, office }: DocumentParams) => {
  const doc = new jsPDF();
  setupHeader(doc, office, lawyer);

  // Título Principal mais compacto
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLOR_HEADER_BG[0], COLOR_HEADER_BG[1], COLOR_HEADER_BG[2]);
  doc.text('PROCURAÇÃO', PAGE_WIDTH / 2, 50, { align: 'center' });
  
  doc.setDrawColor(COLOR_ACCENT[0], COLOR_ACCENT[1], COLOR_ACCENT[2]);
  doc.setLineWidth(1);
  doc.line(PAGE_WIDTH / 2 - 20, 52, PAGE_WIDTH / 2 + 20, 52);

  let currentY = 65;

  // OUTORGANTE
  currentY = drawSectionHeader(doc, 'Outorgante', currentY);
  const clientData = `${client.name}, ${client.nationality || 'Brasileiro(a)'}, ${client.marital_status || 'Solteiro(a)'}, ${client.profession || 'profissional'}, portador(a) do RG nº ${client.rg || '...'} e inscrito(a) no CPF sob o nº ${client.cpf_cnpj}, endereço eletrônico ${client.email || 'não informado'}, residente e domiciliado(a) na ${client.address?.street || '...'}, nº ${client.address?.number || ''}, ${client.address?.neighborhood || ''}, na cidade de ${client.address?.city || '...'} - ${client.address?.state || '...'}, CEP: ${client.address?.cep || '...'}.`;
  currentY = addJustifiedText(doc, clientData, MARGIN_LEFT, currentY, CONTENT_WIDTH);

  // OUTORGADO
  currentY = drawSectionHeader(doc, 'Outorgado', currentY);
  const lawyerName = (lawyer?.name || 'THIAGO MASTRANGELO MARQUES').toUpperCase();
  const lawyerOab = lawyer?.oab || '410.047/SP';
  const officeAddr = office.address || 'R: Manoel Sichieri, 1089';
  const lawyerText = `DR. ${lawyerName}, brasileiro, advogado devidamente inscrito nos quadros da Ordem dos Advogados do Brasil, sob o nº ${lawyerOab}, e inscrito no CPF sob o nº ${lawyer?.phone || '...'}, com escritório profissional localizado à ${officeAddr}.`;
  currentY = addJustifiedText(doc, lawyerText, MARGIN_LEFT, currentY, CONTENT_WIDTH);

  // PODERES
  currentY = drawSectionHeader(doc, 'Poderes', currentY);
  const permsText = "Pelo presente instrumento, o outorgante nomeia e constitui o outorgado seu procurador, a quem confere os amplos poderes contidos na cláusula 'ad judicia et extra', para o foro em geral, em qualquer Instância, Tribunal ou Juízo, bem como os poderes especiais para transigir, desistir, firmar compromissos, receber e dar quitação, reconhecer procedência de pedido, renunciar a direito sobre o qual se funda a ação, e praticar todos os demais atos necessários ao bom e fiel desempenho deste mandato, inclusive substabelecer, com ou sem reserva de poderes.";
  currentY = addJustifiedText(doc, permsText, MARGIN_LEFT, currentY, CONTENT_WIDTH);

  // FINALIDADE
  currentY = drawSectionHeader(doc, 'Finalidade', currentY);
  const finalidadeText = client.process?.description || "A presente procuração destina-se à representação plena do outorgante perante órgãos judiciais e administrativos, visando a defesa de seus direitos e interesses no processo em epígrafe.";
  currentY = addJustifiedText(doc, finalidadeText, MARGIN_LEFT, currentY, CONTENT_WIDTH);

  setupFooter(doc, client.name, client.address?.city || 'Sertãozinho');
  doc.save(`Procuracao_${client.name.replace(/\s+/g, '_')}.pdf`);
};

export const generateDeclaracaoHipossuficienciaPDF = async ({ client, lawyer, office }: DocumentParams) => {
  const doc = new jsPDF();
  setupHeader(doc, office, lawyer);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLOR_HEADER_BG[0], COLOR_HEADER_BG[1], COLOR_HEADER_BG[2]);
  doc.text('DECLARAÇÃO DE HIPOSSUFICIÊNCIA', PAGE_WIDTH / 2, 50, { align: 'center' });
  
  doc.setDrawColor(COLOR_ACCENT[0], COLOR_ACCENT[1], COLOR_ACCENT[2]);
  doc.setLineWidth(1);
  doc.line(PAGE_WIDTH / 2 - 40, 52, PAGE_WIDTH / 2 + 40, 52);

  const income = client.income ? `R$ ${parseFloat(client.income).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00';
  
  const mainText = `${client.name.toUpperCase()}, ${client.nationality || 'Brasileiro(a)'}, ${client.marital_status || 'Solteiro(a)'}, ${client.profession || 'profissional'}, portador(a) do RG nº ${client.rg || '...'} e inscrito(a) no CPF sob o nº ${client.cpf_cnpj}, endereço eletrônico ${client.email || 'não informado'}, residente e domiciliado(a) na ${client.address?.street || '...'}, nº ${client.address?.number || ''}, ${client.address?.neighborhood || ''}, na cidade de ${client.address?.city || '...'} - ${client.address?.state || '...'}, CEP: ${client.address?.cep || '...'}, declara, sob as penas da lei, e nos termos do artigo 1º da Lei 7.115 de 29.08.1983 e artigos 2º e 4º da Lei 1.060 de 05.01.1950 que é pessoa pobre no sentido legal do termo, não tendo condições de prover as despesas do processo sem privar-se dos recursos indispensáveis ao próprio sustento e de sua família, estando percebendo a quantia de ${income} mensais.`;
  
  let currentY = 70;
  currentY = addJustifiedText(doc, mainText, MARGIN_LEFT, currentY, CONTENT_WIDTH);

  const secondText = "Responsabiliza-se o(a) infra-assinado(a) pelo teor da presente declaração, ciente de que poderá se sujeitar as sanções civis e criminais no caso de não ser a presente declaração verdadeira.";
  currentY = addJustifiedText(doc, secondText, MARGIN_LEFT, currentY, CONTENT_WIDTH);

  doc.text("Para maior clareza e os devidos fins de Direito, firma-se a presente Declaração.", MARGIN_LEFT, currentY);

  setupFooter(doc, client.name, client.address?.city || 'Sertãozinho');
  doc.save(`Declaracao_Hipossuficiencia_${client.name.replace(/\s+/g, '_')}.pdf`);
};
