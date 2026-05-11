// src/pages/ProcessingControlPage.jsx
import { useSocket } from '../context/SocketContext';

const ProcessingControlPage = () => {
    const socket = useSocket();
    const [telemetry, setTelemetry] = useState({ temp: 205.5, pressure: 1.2 });

    useEffect(() => {
        if (!socket) return;
        // Lắng nghe dữ liệu từ cảm biến IoT gửi về server
        socket.on('machine_telemetry', (data) => {
            setTelemetry(data);
        });
        return () => socket.off('machine_telemetry');
    }, [socket]);

    return (
        <div>
            {/* Hiển thị số nhảy liên tục */}
            <div className="text-6xl font-bold text-[#3D2B1F]">{telemetry.temp}°C</div>
            <p>Áp suất: {telemetry.pressure} bar</p>
        </div>
    );
};