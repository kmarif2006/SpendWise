import Logo from '../components/common/Logo';

export function generateAndSaveLogos() {
  const sizes = [192, 512];
  
  sizes.forEach(size => {
    const svg = document.createElement('div');
    svg.innerHTML = Logo({ size }).props.children;
    
    const svgData = new XMLSerializer().serializeToString(svg.firstChild);
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      const png = canvas.toDataURL('image/png');
      
      // Download the file
      const link = document.createElement('a');
      link.download = `logo${size}.png`;
      link.href = png;
      link.click();
    };
  });
} 