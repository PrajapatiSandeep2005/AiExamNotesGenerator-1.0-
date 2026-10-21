import axios from "axios";
import { serverURL } from "../App";
import { setUserData } from "../redux/userSlice";

 export const getCurrentUser = async (dispatch) => {
    try {
        const result = await axios.get(serverURL + "/api/user/currentuser", { withCredentials: true });
        dispatch(setUserData(result.data));
        return result.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            localStorage.removeItem("token");
            return null;
        }

        console.error("Failed to fetch current user:", error);
    }
}


export const generateNotes = async (payload) => {
    const result = await axios.post(serverURL + "/api/notes/generate-notes", payload, { withCredentials: true });
    return result.data;
}

export const downloadPdf = async (result) => {
    try{
        const response = await axios.post(serverURL + "/api/pdf/generate-pdf", { results :result }, { withCredentials: true, responseType: 'blob' });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'exam_notes_AI.pdf';
        link.click();
        
        window.URL.revokeObjectURL(url);
    } catch (error) {
        throw new Error("Failed to download PDF. Please try again.", { cause: error });
    }
}