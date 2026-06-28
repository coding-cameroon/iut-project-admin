import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { alertsApi } from "../services/alertsApi";
import { KEYS } from "./queryKeys";

export function useAlerts(params = {}) {
  return useQuery({
    queryKey: KEYS.alerts(params),
    queryFn: () => alertsApi.getAll(params),
    staleTime: 30_000,
  });
}

export function useAlert(id) {
  return useQuery({
    queryKey: KEYS.alertDetail(id),
    queryFn: () => alertsApi.getById(id),
    select: (data) => data.alert,
    enabled: !!id,
  });
}

export function useAlertsByUser(userId) {
  return useQuery({
    queryKey: KEYS.alertsByUser(userId),
    queryFn: () => alertsApi.getByUser(userId),
    select: (data) => data.alert ?? [],
    enabled: !!userId,
  });
}

export function useAlertStats(params = {}) {
  return useQuery({
    queryKey: KEYS.alertStats,
    queryFn: () => alertsApi.getStats(params),
    staleTime: 60_000,
  });
}

export function useUpdateAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => alertsApi.update(id, data),
    onSuccess: (res) => {
      queryClient.setQueryData(KEYS.alertDetail(res.alert.id), res.alert);
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}

export function useDeleteAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => alertsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}
