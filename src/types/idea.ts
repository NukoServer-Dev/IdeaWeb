export interface Idea {
    Idea: string,
    Description: string,
    Author: string,
    CreatedAt: string,
    ID: number,
    LikeCount: number,
    LikedByMe: boolean,
    Replies: { Author: string; Body: string; CreatedAt: string }[],
}
