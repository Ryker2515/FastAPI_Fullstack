import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RelationService } from "../../client";
import { ApiError } from "../../client/core/ApiError";
import useCustomToast from "../../hooks/useCustomToast";

interface AddRelationProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RelationCreateForm {
  fromClientUsername: string;
  toClientUsername: string;
}

const AddRelation = ({ isOpen, onClose }: AddRelationProps) => {
  const queryClient = useQueryClient();
  const showToast = useCustomToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RelationCreateForm>({
    mode: "onBlur",
    defaultValues: {
      fromClientUsername: "",
      toClientUsername: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: RelationCreateForm) =>
      RelationService.createRelation({ requestBody: data }),
    onSuccess: () => {
      showToast("Success!", "Relation created successfully.", "success");
      reset();
      onClose();
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail;
      showToast("Something went wrong.", `${errDetail}`, "error");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["relations"] });
    },
  });

  const onSubmit: SubmitHandler<RelationCreateForm> = (data) => {
    mutation.mutate(data);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size={{ base: "sm", md: "md" }}
        isCentered
      >
        <ModalOverlay />
        <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>Add Relation</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isRequired isInvalid={!!errors.fromClientUsername}>
              <FormLabel htmlFor="fromClientUsername">From Client Username</FormLabel>
              <Input
                id="fromClientId"
                {...register("fromClientUsername", { required: "From Client username is required" })}
                placeholder="From Client Username"
                type="string"
              />
              <FormErrorMessage>{errors.fromClientUsername?.message}</FormErrorMessage>
            </FormControl>
            <FormControl mt={4} isRequired isInvalid={!!errors.toClientUsername}>
              <FormLabel htmlFor="toClientUsername">To Client Username</FormLabel>
              <Input
                id="toClientUsername"
                {...register("toClientUsername", { required: "From client username is required" })}
                placeholder="To Client Username"
                type="string"
              />
              <FormErrorMessage>{errors.toClientUsername?.message}</FormErrorMessage>
            </FormControl>
            {/*<FormControl mt={4} isRequired isInvalid={!!errors.status}>*/}
            {/*  <FormLabel htmlFor="status">Status</FormLabel>*/}
            {/*  <Input*/}
            {/*    id="status"*/}
            {/*    {...register("status", { required: "Status is required" })}*/}
            {/*    placeholder="Status"*/}
            {/*    type="number"*/}
            {/*  />*/}
            {/*  <FormErrorMessage>{errors.status?.message}</FormErrorMessage>*/}
            {/*</FormControl>*/}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} type="submit" isLoading={isSubmitting}>
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AddRelation;
