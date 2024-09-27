export type Body_login_login_access_token = {
    grant_type?: string | null;
    username: string;
    password: string;
    scope?: string;
    client_id?: string | null;
    client_secret?: string | null;
};


export type HTTPValidationError = {
    detail?: Array<ValidationError>;
};


export type ItemCreate = {
    title: string;
    description?: string | null;
};


export type ItemPublic = {
    title: string;
    description?: string | null;
    id: number;
    owner_id: number;
};


export type ItemUpdate = {
    title?: string | null;
    description?: string | null;
};


export type ItemsPublic = {
    data: Array<ItemPublic>;
    count: number;
};


export type Message = {
    message: string;
};


export type NewPassword = {
    token: string;
    new_password: string;
};


export type Token = {
    access_token: string;
    token_type?: string;
};


export type UpdatePassword = {
    current_password: string;
    new_password: string;
};


export type UserCreate = {
    email: string;
    is_active?: boolean;
    is_superuser?: boolean;
    full_name?: string | null;
    password: string;
};


export type UserPublic = {
    email: string;
    is_active?: boolean;
    is_superuser?: boolean;
    full_name?: string | null;
    id: number;
};


export type UserRegister = {
    email: string;
    password: string;
    full_name?: string | null;
};


export type UserUpdate = {
    email?: string | null;
    is_active?: boolean;
    is_superuser?: boolean;
    full_name?: string | null;
    password?: string | null;
};


export type UserUpdateMe = {
    full_name?: string | null;
    email?: string | null;
};


export type UsersPublic = {
    data: Array<UserPublic>;
    count: number;
};


export type ValidationError = {
    loc: Array<string | number>;
    msg: string;
    type: string;
};

export type ClientPublic = {
    id: number;
    name: string;
    nickname: string;
    instagram: string;
    openForConnections: number;
    priority: number;
    isReached: number;
    status: number;
}

export type ClientsPublic = {
    data: Array<ClientPublic>;
    count: number;
}

export type ClientCreate = {
    name: string;
    nickname: string;
    instagram: string;
    openForConnections: number;
    priority: number;
    isReached: number;
    status: number;
    userId: string,
    howHardToReach: number,
    parameterOne: number,
    parameterTwo: string,
    parameterThree: string,
}

export type ClientUpdate = {
    name?: string | null;
    nickname?: string | null;
    instagram?: string | null;
    openForConnections?: number | null;
    priority?: number | null;
    isReached?: number | null;
    status?: number | null;
    howHardToReach?: number | null;
    parameterOne?: number | null;
    parameterTwo?: number | null;
    parameterThree?: string | null;
}

export type RelationPublic = {
    id: number;
    fromClientId: number;
    toClientId: number;
    status: number;
    from_client_name: string;
    to_client_name: string;
}

export type RelationsPublic = {
    data: Array<RelationPublic>;
    count: number;
}

export type RelationCreate = {
    fromClientId: number;
    toClientId: number;
    status: number;
}

export type RelationUpdate = {
    fromClientId?: number | null;
    toClientId?: number | null;
    status?: number | null;
}