import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

type QRCodeDisplayProps = {
  url: string;
  filename: string;
};

export default function QRCodeDisplay({ url, filename }: QRCodeDisplayProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  console.log('url', url);

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;
    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `${filename}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div>
      <div ref={qrRef}>
        <QRCodeCanvas value={url} size={200} />
      </div>
      <button onClick={handleDownload}>Download QR Code</button>
      <p>URL: <a href={url}>{url}</a></p>
    </div>
  );
}
