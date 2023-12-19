import axios from "axios";

const uploadImage = async (file: File) => {
	console.log('file', file);
	const data = new FormData();
	data.append("my_file", file);

	return axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/upload-image`, data);
}

export default uploadImage;
