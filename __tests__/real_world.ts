/**
 * @file RealWorld API model definitions
 */

export class LoginUser {
    constructor(
        public email: string,
        public password: string,
    ) {}
}

export class LoginUserRequest {
    constructor(
        public user: LoginUser,
    ) {}
}

export class NewUser extends LoginUser {
    constructor(
        public username: string,
    ) {
        super("", "");
    }
}

export class NewUserRequest {
    constructor(
        public user: NewUser,
    ) {}
}

export class User {
    constructor(
        public email: string,
        public token: string,
        public username: string,
        public bio: string,
        public image: string,
    ) {}
}

export class UserResponse {
    constructor(
        public user: User,
    ) {}
}

export class UpdateUser implements Partial<User> {}

export class UpdateUserRequest {
    constructor(
        public user: UpdateUser,
    ) {}
}

export class Profile {
    constructor(
        public username: string,
        public bio: string,
        public image: string,
        public following: boolean,
    ) {}
}

export class ProfileResponse {
    constructor(
        public profile: Profile,
    ) {}
}

export class Article {
    constructor(
        public slug: string,
        public title: string,
        public description: string,
        public body: string,
        public tagList: string[],
        public createdAt: string,
        public updatedAt: string,
        public favorited: boolean,
        public favoritesCount: number,
        public author: Profile,
    ) {}
}

export class SingleArticleResponse {
    constructor(
        public article: Article,
    ) {}
}

export class MultipleArticlesResponse {
    constructor(
        public articles: Article[],
        public articlesCount: number,
    ) {}
}

export class NewArticle {
    constructor(
        public title: string,
        public description: string,
        public body: string,
        public tagList?: string[],
    ) {}
}

export class NewArticleRequest {
    constructor(
        public article: NewArticle,
    ) {}
}

export class UpdateArticle implements Partial<Omit<NewArticle, "tagList">> {}

export class UpdateArticleRequest {
    constructor(
        public article: UpdateArticle,
    ) {}
}

export class Comment {
    constructor(
        public id: number,
        public createAt: string,
        public updateAt: string,
        public body: string,
        public author: Profile,
    ) {}
}

export class SingleCommentResponse {
    constructor(
        public comment: Comment,
    ) {}
}

export class MultipleCommentResponse {
    constructor(
        public comments: Comment[],
    ) {}
}

export class NewComment {
    constructor(
        public body: string,
    ) {}
}

export class NewCommentRequest {
    constructor(
        public comment: NewComment,
    ) {}
}

export class TagsResponse {
    constructor(
        public tags: string[],
    ) {}
}

export class GenericErrorModel {
    constructor(
        public errors: {
            body: string[];
        },
    ) {}
}
