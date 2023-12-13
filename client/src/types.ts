export type UserAuth = {
	"access_token": string;
	"profile_img": string;
	"username": string;
	"fullname": string;
} | { "access_token": null }

export type UserAuthContext = {
	userAuth: UserAuth | undefined;
	setUserAuth:  React.Dispatch<React.SetStateAction<UserAuth | undefined>>
}
