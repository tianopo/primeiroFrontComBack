import { useEffect, useRef, useState } from "react";

export const Record = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaBlobUrl, setMediaBlobUrl] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [position, setPosition] = useState({ x: 50, y: 50 }); // Posição da câmera na tela

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<Blob[]>([]);
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);

  // Solicita a gravação da câmera quando o componente é montado (para pré-visualização)
  useEffect(() => {
    const getCameraStream = async () => {
      const newCameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      setCameraStream(newCameraStream);
    };

    getCameraStream();
    return () => {
      // Limpar stream quando o componente for desmontado
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Função para iniciar a gravação
  const handleStartRecording = async () => {
    // Solicita a gravação da tela
    const screenStream = await (navigator.mediaDevices as any).getDisplayMedia({
      video: true,
    });

    // Solicita a gravação da câmera com áudio
    const newCameraStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    setCameraStream(newCameraStream); // Atualiza o stream da câmera

    // Combina os dois streams (tela + câmera)
    const combinedStream = new MediaStream([
      ...screenStream.getTracks(),
      ...newCameraStream.getTracks(),
    ]);

    mediaRecorderRef.current = new MediaRecorder(combinedStream, {
      mimeType: "video/webm",
    });

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.current.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunks.current, {
        type: "video/webm",
      });
      const url = URL.createObjectURL(blob);
      setMediaBlobUrl(url);
      recordedChunks.current = [];
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  // Função para parar a gravação
  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    // Parar os streams de vídeo e áudio
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }
  };

  // Função para fazer download do vídeo gravado
  const handleDownload = () => {
    if (mediaBlobUrl) {
      const a = document.createElement("a");
      a.href = mediaBlobUrl;
      a.download = "recording.webm";
      a.click();
    }
  };

  // Exibir a pré-visualização da câmera
  useEffect(() => {
    if (cameraVideoRef.current && cameraStream) {
      cameraVideoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  // Função para arrastar a pré-visualização da câmera
  const handleDrag = (event: React.MouseEvent<HTMLDivElement>) => {
    setPosition({
      x: event.clientX,
      y: event.clientY,
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="mb-4 text-3xl font-bold">Screen & Camera Recorder</h1>

      <div className="mb-6">
        {!isRecording ? (
          <button
            onClick={handleStartRecording}
            className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-700"
          >
            Iniciar Gravação
          </button>
        ) : (
          <button
            onClick={handleStopRecording}
            className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-700"
          >
            Parar Gravação
          </button>
        )}
      </div>

      {/* Pré-visualização da câmera com reposicionamento */}
      {cameraStream && (
        <div
          style={{
            position: "absolute",
            top: `${position.y}px`,
            left: `${position.x}px`,
            cursor: "move",
          }}
          onMouseDown={(e) => e.preventDefault()} // Evita seleção de texto ao arrastar
          onMouseMove={(e) => e.buttons === 1 && handleDrag(e)}
          className="draggable-video"
        >
          <video
            ref={cameraVideoRef}
            autoPlay
            playsInline
            muted
            className="h-30 mb-4 w-40 rounded-lg bg-black"
          />
        </div>
      )}

      {mediaBlobUrl && (
        <div className="flex flex-col items-center">
          <video
            src={mediaBlobUrl}
            controls
            className="mb-4 w-full max-w-2xl rounded-lg shadow-lg"
          />

          <button
            onClick={handleDownload}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700"
          >
            Baixar Gravação
          </button>
        </div>
      )}
    </div>
  );
};
