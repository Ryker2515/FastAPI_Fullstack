from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select, func
from sqlalchemy import delete
from sqlalchemy.orm import aliased
from app.api.deps import CurrentUser, SessionDep
from app.models import Relations, RelationsCreate, RelationsPublic, Clients

router = APIRouter()


@router.get("/", response_model=RelationsPublic)
def get_relations(session: SessionDep, skip: int = 0, limit: int = 100) -> Any:
    """
    Retrieve relations with client names.
    """
    from_client = aliased(Clients)
    to_client = aliased(Clients)

    count_statement = select(func.count()).select_from(Relations)
    count = session.exec(count_statement).one()

    statement = (
        select(
            Relations,
            from_client.name.label("from_client_name"),
            to_client.name.label("to_client_name"),
        )
        .join(from_client, Relations.fromClientId == from_client.userId)
        .join(to_client, Relations.toClientId == to_client.userId)
        .offset(skip)
        .limit(limit)
    )
    relations = session.exec(statement).all()
    # logger.info(relations)
    # Create a list of dictionaries with the expected format
    data = [
        {
            "id": relation.id,
            "fromClientId": relation.fromClientId,
            "toClientId": relation.toClientId,
            "status": relation.status,
            "from_client_name": from_client_name,
            "to_client_name": to_client_name,
        }
        for relation, from_client_name, to_client_name in relations
    ]
    return RelationsPublic(data=data, count=count)


@router.post("/", response_model=Relations)
def create_relation(
        *,
        session: SessionDep,
        current_user: CurrentUser,
        relation_in: RelationsCreate
) -> Any:
    """
    Create new relation.
    """
    from_client = session.execute(
        select(Clients).where(Clients.nickname == relation_in.fromClientUsername)
    ).scalar_one_or_none()

    to_client = session.execute(
        select(Clients).where(Clients.nickname == relation_in.toClientUsername)
    ).scalar_one_or_none()
    print(from_client, to_client)
    if from_client is not None and to_client is not None:
        relation = Relations(fromClientId=from_client.userId, toClientId=to_client.userId, owner_id=current_user.id)
        session.add(relation)
        session.commit()
        session.refresh(relation)
        return relation
    else:
        raise HTTPException(status_code=404, detail="Relations not found")


@router.delete("/{relation_id}")
def delete_relation(relation_id: int, session: SessionDep, current_user: CurrentUser) -> None:
    statement = delete(Relations).where(Relations.id == relation_id).returning(Relations.id)
    result = session.exec(statement).scalar_one_or_none()
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Relation with id {relation_id} not found"
        )
    session.commit()
    return None
