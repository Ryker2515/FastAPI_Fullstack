import csv
from io import StringIO
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import aliased
from sqlalchemy.exc import IntegrityError, DataError
from sqlmodel import func, select
from sqlalchemy import select as sa_select, delete

from app.api.deps import CurrentUser, SessionDep
from app.models import Clients, ClientCreate, ClientsPublic, ClientPublic, RelationsPublic, Relations, \
    RelationWithRelations, ClientUpdate
import logging

from app.image import download_image

router = APIRouter()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@router.get("/", response_model=ClientsPublic)
def get_clients(session: SessionDep, skip: int = 0, limit: int = 100) -> Any:
    """
    Retrieve clients.
    """

    count_statement = select(func.count()).select_from(Clients)
    count = session.exec(count_statement).one()

    statement = select(Clients).offset(skip).limit(limit)
    users = session.exec(statement).all()
    # logger.info(f"users: {users}")
    # logger.info(f"count: {count}")
    # logger.info("Guy!!!")
    return ClientsPublic(data=users, count=count)


@router.post("/", response_model=Clients)
def create_client(
        *, session: SessionDep, current_user: CurrentUser, client_in: ClientCreate
) -> Any:
    """
    Create new Client.
    """
    # Download the Instagram profile image
    try:
        instagram_image_path = download_image(client_in.instagram, str(client_in.userId))
    except Exception as e:
        instagram_image_path = 'default.png'  # Set a default image path in case of error

    if instagram_image_path is None:
        instagram_image_path = 'default.png'  # Set a default image path if download fails

    # Create the client instance with the Instagram image path
    client_data = client_in.dict(exclude={"otherRelations"})
    client_data["instagram"] = instagram_image_path

    client = Clients.model_validate(client_data, update={"owner_id": current_user.id})
    session.add(client)
    session.commit()
    session.refresh(client)

    with session.no_autoflush:  # Use no_autoflush to prevent premature flushing
        # Process otherRelations
        if len(client_in.otherRelations) > 0 and client_in.otherRelations[0] != "":
            for userId in client_in.otherRelations:
                # Check if the toClientId exists in the clients table using a database query
                existing_client = session.execute(
                    sa_select(Clients).where(Clients.userId == userId)
                ).scalar_one_or_none()

                if not existing_client:
                    session.rollback()  # Rollback the transaction if the userId does not exist
                    raise HTTPException(status_code=400, detail=f"Client with id {userId} does not exist")

                relation = Relations(fromClientId=client.userId, toClientId=userId)
                session.add(relation)

    session.commit()
    return client



@router.post("/file")
async def create_clients_from_file(*, group_name: str, session: SessionDep, current_user: CurrentUser,
                                   file: UploadFile = File(...)) -> Any:
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only .csv files are allowed")

    content = await file.read()
    decoded_content = content.decode('utf-8')
    csv_reader = csv.reader(StringIO(decoded_content))

    # Skip the header row
    next(csv_reader)

    # Store created clients to handle relations after creation
    other_relations = {}
    for row in csv_reader:
        if len(row) < 12:
            raise HTTPException(status_code=400, detail="CSV row has insufficient columns")

        # Convert "YES" to 1, "NO" to 0, and UNKNOWN to 2
        open_for_connections = None
        if row[4].strip().upper() == "YES":
            open_for_connections = 1
        elif row[4].strip().upper() == "NO":
            open_for_connections = 0
        elif row[4].strip().upper() == "UNKNOWN":
            open_for_connections = 2

        # Convert "YES" to 1, "NO" to 0, and UNKNOWN to 2
        is_reached = 0
        if row[5].strip().upper() == "YES":
            is_reached = 1

        image_name = download_image(row[0], str(row[3]))
        if not image_name:
            image_name = 'default.png'

        client_data = {
            "name": row[2],
            "nickname": row[1],
            "instagram": image_name,
            "userId": row[3],
            "openForConnections": open_for_connections,
            "isReached": is_reached,
            "howHardToReach": int(row[6]),
            "priority": int(row[7]),
            "parameterOne": row[8],
            "parameterTwo": row[9],
            "parameterThree": row[10],
            "groupName": group_name,
            "otherRelations": [x for x in row[11].split(',') if x] if row[11] else []
        }

        client_create = ClientCreate(**client_data)
        client = Clients(**client_create.dict(exclude={"otherRelations"}))
        # client.owner_id = current_user.id
        try:
            session.add(client)
            session.commit()
            session.refresh(client)

            other_relations[client.userId] = client_create.otherRelations
        except IntegrityError:
            session.rollback()
            print(f"Client with userId {client.userId} already exists. Skipping this entry.")
            continue

    # Process otherRelations
    for from_client_id, relations in other_relations.items():
        for to_client_id in relations:
            try:
                # Check if the toClientId exists in the clients table using a database query
                existing_client = session.query(Clients).filter_by(userId=to_client_id).first()

                if existing_client:
                    relation = Relations(fromClientId=from_client_id, toClientId=existing_client.userId)
                    session.add(relation)
                    session.commit()
                    session.refresh(relation)
            except DataError as e:
                # Log the error and continue
                print(f"Error processing to_client_id {to_client_id}: {e}")
                # session.rollback()
            except Exception as e:
                # Log any other unexpected errors and continue
                print(f"Unexpected error: {e}")
                session.rollback()

    return {"message": "Clients and relations created successfully"}


# get client by id
@router.get("/{client_id}", response_model=ClientPublic)
def get_client_by_id(client_id: str, session: SessionDep) -> Any:
    """
    Retrieve client by id.
    """
    statement = select(Clients).where(Clients.userId == client_id)
    client = session.exec(statement).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


# get client by id
@router.patch("/{client_id}", response_model=ClientPublic)
def patch_client(client_id: int, client_update: ClientUpdate, session: SessionDep,
                 current_user: CurrentUser) -> Any:
    print(client_update)
    # Fetch the client
    client = session.query(Clients).filter(Clients.id == client_id).first()

    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    # Update the client fields
    for var, value in vars(client_update).items():
        if value is not None:
            setattr(client, var, value)

    # Commit the changes
    session.add(client)
    session.commit()
    session.refresh(client)

    return client


@router.delete("/{client_id}")
def delete_client(client_id: int, session: SessionDep, current_user: CurrentUser) -> None:
    statement = delete(Clients).where(Clients.id == client_id).returning(Clients.id)
    result = session.exec(statement).scalar_one_or_none()
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Client with id {client_id} not found"
        )
    session.commit()
    return None


@router.get("/{client_id}/relations", response_model=RelationsPublic | Clients)
def get_client_relations(client_id: str, session: SessionDep, skip: int = 0, limit: int = 100) -> Any:
    """
    Retrieve relations associated with a client, including client data.
    """
    from_client = aliased(Clients)
    to_client = aliased(Clients)
    inner_from_client = aliased(Clients)
    inner_to_client = aliased(Clients)

    # Query the client to check if it exists
    client = session.exec(select(Clients).where(Clients.userId == client_id)).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    # Count total relations for the client
    count_statement = (
        select(func.count())
        .where((Relations.fromClientId == client_id) | (Relations.toClientId == client_id))
    )
    count = session.exec(count_statement).one()

    print("************")
    print(count)
    print(client)

    if count == 0:
        return client

    # Query relations with client data for both source and target clients
    # relations_statement = (
    #     select(
    #         Relations,
    #         from_client.name.label("from_client_name"),
    #         to_client.name.label("to_client_name"),
    #     )
    #     .join(from_client, Relations.fromClientId == from_client.userId)
    #     .join(to_client, Relations.toClientId == to_client.userId)
    #     .where((Relations.fromClientId == client_id) | (Relations.toClientId == client_id))
    #     .offset(skip)
    #     .limit(limit)
    # )
        # Query relations with client data for both source and target clients
    relations_statement = (
        select(
            Relations,
            from_client.name.label("from_client_name"),
            from_client.instagram.label("fromClientInstagram"),
            to_client.name.label("to_client_name"),
            to_client.instagram.label("toClientInstagram"),
        )
        .join(from_client, Relations.fromClientId == from_client.userId)
        .join(to_client, Relations.toClientId == to_client.userId)
        .where((Relations.fromClientId == client_id) | (Relations.toClientId == client_id))
        .offset(skip)
        .limit(limit)
    )
    relations = session.exec(relations_statement).all()

    # Create a list of dictionaries with the expected format
    data = []
    for relation, from_client_name, from_client_instagram, to_client_name, to_client_instagram in relations:
        relation_dict = relation.dict()
        relation_dict["from_client_name"] = from_client_name
        relation_dict["to_client_name"] = to_client_name
        relation_dict["fromClientInstagram"] = from_client_instagram
        relation_dict["toClientInstagram"] = to_client_instagram

        inner_id = 0
        if relation.toClientId == client_id:
            inner_id=relation.fromClientId
        else:
            inner_id=relation.toClientId
        # Fetch relations of relations (2 levels deep)
        inner_relations_statement = (
            select(
                Relations,
                inner_from_client.name.label("from_client_name"),
                inner_from_client.instagram.label("fromClientInstagram"),
                inner_to_client.instagram.label("toClientInstagram"),
                inner_to_client.name.label("to_client_name"),
            )
            .join(inner_from_client, Relations.fromClientId == inner_from_client.userId)
            .join(inner_to_client, Relations.toClientId == inner_to_client.userId)
            .where(
                (Relations.fromClientId == inner_id)
                | (Relations.toClientId == inner_id)
            )
            .where(
                Relations.id != relation.id  # Make sure not to include the parent relation itself
            )
        )

        inner_relations = session.exec(inner_relations_statement).all()

        inner_data = []
        for inner_relation, inner_from_client_name, inner_from_client_instagram, inner_to_client_instagram, inner_to_client_name in inner_relations:
            inner_relation_dict = inner_relation.dict()
            inner_relation_dict["from_client_name"] = inner_from_client_name
            inner_relation_dict["to_client_name"] = inner_to_client_name
            inner_relation_dict["fromClientInstagram"] = inner_from_client_instagram
            inner_relation_dict["toClientInstagram"] = inner_to_client_instagram
            inner_data.append(inner_relation_dict)

        relation_dict["relations"] = inner_data

        data.append(relation_dict)

    logger.info(f"data: {data}")
    return RelationsPublic(data=data, count=count)
