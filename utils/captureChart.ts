export async function captureChartAsImage(chartId: string): Promise<string> {
  const chartElement = document.getElementById(chartId);
  if (!chartElement) return '';

  const svgElement = chartElement.querySelector('svg');
  if (!svgElement) return '';

  const svgData = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = svgElement.clientWidth * 2; // High DPI
      canvas.height = svgElement.clientHeight * 2;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(2, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, svgElement.clientWidth, svgElement.clientHeight);
        ctx.drawImage(img, 0, 0);
      }

      const dataUrl = canvas.toDataURL('image/png');
      URL.revokeObjectURL(svgUrl);
      resolve(dataUrl);
    };
    img.src = svgUrl;
  });
}
