import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../services/dashboardApi";
import { KEYS } from "./queryKeys";

export function useDashboardStats(params = {}) {
  return useQuery({
    queryKey: KEYS.dashboardStats(params),
    queryFn: () => dashboardApi.getStats(params),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useDashboardTimeline(days = 7) {
  return useQuery({
    queryKey: KEYS.dashboardTimeline(days),
    queryFn: () => dashboardApi.getTimeline({ days }),
    staleTime: 60_000,
  });
}

export function useDashboardMapAlerts(params = {}) {
  return useQuery({
    queryKey: KEYS.dashboardMap(params),
    queryFn: () => dashboardApi.getMapAlerts(params),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useDashboardNotifications() {
  return useQuery({
    queryKey: KEYS.dashboardNotifs,
    queryFn: dashboardApi.getNotifications,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}
