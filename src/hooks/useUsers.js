import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../services/usersApi";
import { KEYS } from "./queryKeys";

export function useUsers(params = {}) {
  return useQuery({
    queryKey: KEYS.users(params),
    queryFn: () => usersApi.getAll(params),
    staleTime: 30_000,
  });
}

export function useUser(id) {
  return useQuery({
    queryKey: KEYS.userDetail(id),
    queryFn: () => usersApi.getById(id),
    select: (data) => data.user,
    enabled: !!id,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => usersApi.update(id, data),
    onSuccess: (res) => {
      queryClient.setQueryData(KEYS.userDetail(res.user.id), res.user);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
