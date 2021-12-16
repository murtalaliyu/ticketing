// useRequest can only be called/used inside of a react component. That is why we have to use buildClient which uses axios for requests in getInitialProps

import Link from 'next/link';

const LandingPage = ({ currentUser, tickets }) => {
  const ticketList = tickets.map(ticket => {
    return (
      <tr key={ticket.id}>
        <td>{ticket.title}</td>
        <td>{ticket.price}</td>
        <td>{ticket.orderId ? "Y" : "N"}</td>
        <td>
          <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
            <a>View</a>
          </Link>
        </td>
      </tr>
    );
  });

  return (
    <div>
      <h1>Tickets</h1>

      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Reserved?</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {ticketList}
        </tbody>
      </table>
    </div>
  );
};

// Note: This is information fetching for the just the index page
LandingPage.getInitialProps = async (context, client, currentUser) => {
  const { data } = await client.get('/api/tickets');
  return { tickets: data };
};

export default LandingPage;
