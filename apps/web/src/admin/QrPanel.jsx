import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { api } from "../api";

export default function QrPanel() {
  const [qrData, setQrData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await api.getQr();
        const [appQr, webQr] = await Promise.all([
          QRCode.toDataURL(data.appDownloadUrl, { width: 280, margin: 1 }),
          QRCode.toDataURL(data.webUrl, { width: 280, margin: 1 }),
        ]);
        if (mounted) setQrData({ ...data, appQr, webQr });
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <p className="admin-empty">Generando códigos QR...</p>;
  if (error) return <p className="admin-empty">Error: {error}</p>;

  return (
    <div className="qr-panel">
      <p className="admin-note">
        Imprime o comparte estos códigos QR. Uno lleva a la descarga de la app y
        el otro a la página web del gimnasio.
      </p>
      <div className="qr-grid">
        <div className="qr-card">
          <h3>Descargar la App</h3>
          {qrData.appQr && <img src={qrData.appQr} alt="QR de descarga de la app" />}
          <a href={qrData.appDownloadUrl} target="_blank" rel="noreferrer">
            {qrData.appDownloadUrl}
          </a>
        </div>
        <div className="qr-card">
          <h3>Página Web</h3>
          {qrData.webQr && <img src={qrData.webQr} alt="QR de la página web" />}
          <a href={qrData.webUrl} target="_blank" rel="noreferrer">
            {qrData.webUrl}
          </a>
        </div>
      </div>
    </div>
  );
}
