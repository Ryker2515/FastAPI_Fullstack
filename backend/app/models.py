from typing import Optional

from sqlmodel import Field, Relationship, SQLModel


# Shared properties
# TODO replace email str with EmailStr when sqlmodel supports it
class UserBase(SQLModel):
    email: str = Field(unique=True, index=True)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = None


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str


# TODO replace email str with EmailStr when sqlmodel supports it
class UserRegister(SQLModel):
    email: str
    password: str
    full_name: str | None = None


# Properties to receive via API on update, all are optional
# TODO replace email str with EmailStr when sqlmodel supports it
class UserUpdate(UserBase):
    email: str | None = None  # type: ignore
    password: str | None = None


# TODO replace email str with EmailStr when sqlmodel supports it
class UserUpdateMe(SQLModel):
    full_name: str | None = None
    email: str | None = None


class UpdatePassword(SQLModel):
    current_password: str
    new_password: str


# Database model, database table inferred from class name
class User(UserBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    hashed_password: str
    items: list["Item"] = Relationship(back_populates="owner")


# Properties to return via API, id is always required
class UserPublic(UserBase):
    id: int


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int


# Shared properties
class ItemBase(SQLModel):
    title: str
    description: str | None = None


# Properties to receive on item creation
class ItemCreate(ItemBase):
    title: str


# Properties to receive on item update
class ItemUpdate(ItemBase):
    title: str | None = None  # type: ignore


# Database model, database table inferred from class name
class Item(ItemBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str
    owner_id: int | None = Field(default=None, foreign_key="user.id", nullable=False)
    owner: User | None = Relationship(back_populates="items")


# Properties to return via API, id is always required
class ItemPublic(ItemBase):
    id: int
    owner_id: int


class ItemsPublic(SQLModel):
    data: list[ItemPublic]
    count: int


# Generic message
class Message(SQLModel):
    message: str


# JSON payload containing access token
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


# Contents of JWT token
class TokenPayload(SQLModel):
    sub: int | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str


class ClientBase(SQLModel):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    nickname: str
    instagram: str
    openForConnections: int | None = Field(default=0)
    priority: int | None = Field(default=0)
    isReached: int | None = Field(default=0)
    status: int | None = Field(default=1)
    groupName: str | None = Field(default=None)


class ClientCreate(ClientBase):
    name: str
    nickname: str
    instagram: str
    openForConnections: int | None = Field(default=0)
    priority: int | None = Field(default=0)
    isReached: int | None = Field(default=0)
    status: int | None = Field(default=1)
    userId: str
    howHardToReach: int
    parameterOne: str | None = Field(default=None)
    parameterTwo: str | None = Field(default=None)
    parameterThree: str | None = Field(default=None)
    otherRelations: list[str] = Field(default=[])
    groupName: str | None = Field(default=None)


# Database model, database table inferred from class name
class Clients(ClientBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    nickname: str
    instagram: str
    openForConnections: int | None = Field(default=0)
    priority: int | None = Field(default=0)
    isReached: int | None = Field(default=0)
    status: int | None = Field(default=1)
    userId: str
    howHardToReach: int
    parameterOne: str | None = Field(default=None)
    parameterTwo: str | None = Field(default=None)
    parameterThree: str | None = Field(default=None)
    groupName: str | None = Field(default=None)


class ClientsPublic(SQLModel):
    data: list[Clients]
    count: int


class ClientPublic(ClientBase):
    # id: int
    name: str
    nickname: str
    instagram: str
    openForConnections: int | None = Field(default=0)
    priority: int | None = Field(default=0)
    isReached: int | None = Field(default=0)
    status: int | None = Field(default=1)
    userId: str
    howHardToReach: int
    parameterOne: str | None = Field(default=None)
    parameterTwo: str | None = Field(default=None)
    parameterThree: str | None = Field(default=None)
    groupName: str | None = Field(default=None)


class ClientUpdate(ClientBase):
    name: str | None = Field(default=None)
    nickname: str | None = Field(default=None)
    instagram: str | None = Field(default=None)
    openForConnections: int | None = Field(default=0)
    priority: int | None = Field(default=0)
    isReached: int | None = Field(default=0)
    status: int | None = Field(default=1)
    howHardToReach: int | None = Field(default=None)
    parameterOne: str | None = Field(default=None)
    parameterTwo: str | None = Field(default=None)
    parameterThree: str | None = Field(default=None)
    groupName: str | None = Field(default=None)


class RelationsBase(SQLModel):
    id: int | None = Field(default=None, primary_key=True)
    fromClientId: str
    toClientId: str
    status: int | None = Field(default=1)


class Relations(RelationsBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    fromClientId: str
    toClientId: str
    status: int | None = Field(default=1)


class RelationPublic(RelationsBase):
    id: int
    fromClientId: str
    toClientId: str
    fromClientInstagram: str | None = Field(default=None)
    toClientInstagram: str | None = Field(default=None)
    status: int | None = Field(default=1)
    from_client_name: str
    to_client_name: str
    relations: list[Optional['RelationPublic']] = []


class RelationsPublic(SQLModel):
    data: list[RelationPublic]
    count: int


class RelationsCreate(SQLModel):
    fromClientUsername: str
    toClientUsername: str


class RelationsUpdate(RelationsBase):
    status: int | None = Field(default=1)


class RelationWithRelations(RelationPublic):
    relations: list[RelationPublic] = []
