CREATE POLICY "Owners update bookings for their gyms"
ON public.bookings FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.gyms g
    WHERE g.id = bookings.gym_id AND g.owner_id = auth.uid()
  )
);