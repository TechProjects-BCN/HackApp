export const getBackendUrl = () => {
    if (typeof window !== "undefined") {
        return `http://${window.location.hostname}:5000`;
    }
    return process.env.NEXT_PUBLIC_BKG_HOST || "http://localhost:5000";
};
