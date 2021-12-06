import { Ticket } from "../ticket";

it('implements optimistic concurrency control', async () => {
  // Create an instance of a Ticket
  const ticket = Ticket.build({
    title: 'this is a valid title',
    price: 5,
    userId: '123'
  });

  // Save the Ticket to the database
  await ticket.save();

  // Fetch the Ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // Make two separate changes to the Tickets we fetched
  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 15 });

  // Save the first fetched Ticket
  await firstInstance!.save();

  // Save the second fetched Ticket and expect an error
  try {
    await secondInstance!.save();
  } catch (err) {
    return;
  }

  throw new Error('Should not reach this point');
});

it('increments the version number on multiple saves', async () => {
  const ticket = Ticket.build({
    title: 'this is a valid title',
    price: 5,
    userId: '123'
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);

  await ticket.save();
  expect(ticket.version).toEqual(1);

  await ticket.save();
  expect(ticket.version).toEqual(2);

});
