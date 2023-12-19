// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import Embed from '@editorjs/embed';
import List from '@editorjs/list';
import Image from '@editorjs/image';
import Header from '@editorjs/header';
import Quote from '@editorjs/quote';
import Marker from '@editorjs/marker';
import InlineCode from '@editorjs/inline-code';
import uploadImage from "../common/uploadImage.ts";


const uploadImageByFile = async (e) => {
	try {
		const res = await uploadImage(e);
		if (res) {
			return {
				success: 1,
				file: { url: res.data.url }
			}
		}
	} catch (err) {
		console.log(err);
	}
}

const uploadImageByUrl = async (e) => {
	const link = new Promise((resolve) => {
		resolve(e);
	})

	return link.then(url => {
		return {
			success: 1,
			file: { url },
		}
	})
}
export const tools = {
	embed: Embed,
	list: {
		class: List,
		inlineToolbar: true,
	},
	image: {
		class: Image,
		config: {
			uploader: {
				uploadByUrl: uploadImageByUrl,
				uploadByFile: uploadImageByFile,
			}
		}
	},
	header: {
		class: Header,
		config: {
			placeholder: 'Type Heading...',
			levels: [2, 3],
			defaultLevel: 2,
		}
	},
	quote: {
		class: Quote,
		inlineToolbar: true,
	},
	marker: Marker,
	inlineCode: InlineCode,
}
