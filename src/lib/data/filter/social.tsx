import { EmailIcon } from '@chakra-ui/icons';
import { Wrap } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { FaFacebookSquare } from 'react-icons/fa';
import { RiTwitterFill } from 'react-icons/ri';
import {
	EmailShareButton,
	FacebookShareButton,
	TwitterShareButton
} from 'react-share';

const SocialMedia = () => {
	const router = useRouter();

	let url = router.asPath;
	return (
		<Wrap display={'inline-flex'}>
			<FacebookShareButton url={url}>
				<FaFacebookSquare color="gray" />
			</FacebookShareButton>

			<TwitterShareButton url={url}>
				<RiTwitterFill color="lightpurple" />
			</TwitterShareButton>

			<EmailShareButton url={url}>
				<EmailIcon />
			</EmailShareButton>
		</Wrap>
	);
};
export { SocialMedia };
