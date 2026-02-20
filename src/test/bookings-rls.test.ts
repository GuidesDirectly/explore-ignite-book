import { describe, it, expect } from "vitest";
import { supabase } from "@/integrations/supabase/client";

describe("Bookings RLS policies", () => {
  it("should allow anonymous users to insert a booking", async () => {
    // Anonymous insert should work (WITH CHECK (true) policy)
    const { error } = await supabase.from("bookings").insert({
      guide_user_id: "00000000-0000-0000-0000-000000000001",
      traveler_name: "Test Traveler",
      date: "2026-03-01",
      time: "10:00",
      tour_type: "Walking Tour",
      group_size: 2,
      price: 50,
    });

    // Insert should succeed due to public INSERT policy
    expect(error).toBeNull();
  });

  it("should NOT allow anonymous users to read bookings", async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .limit(1);

    // Anonymous users should get empty results (no SELECT policy for anon)
    expect(data).toEqual([]);
  });

  it("should NOT allow anonymous users to update bookings", async () => {
    const { data, error } = await supabase
      .from("bookings")
      .update({ status: "confirmed" })
      .eq("guide_user_id", "00000000-0000-0000-0000-000000000001")
      .select();

    // Should return empty - no rows matched due to RLS
    expect(data).toEqual([]);
  });

  it("should NOT allow anonymous users to delete bookings", async () => {
    const { data, error } = await supabase
      .from("bookings")
      .delete()
      .eq("guide_user_id", "00000000-0000-0000-0000-000000000001")
      .select();

    // Should return empty - no DELETE policy exists for non-admins
    expect(data).toEqual([]);
  });
});
