import { Can } from "../componets/Can";
import { useCan } from "../hooks/useCan";
import { api } from "./services/apiClient";
import { useContext, useEffect } from "react";
import { setupAPIClient } from "./services/api";
import { withSSRAuth } from "../../utils/withSSRAuth";
import { AuthContext } from "../contexts/AuthContext";

export default function Dashboard() {
  const { user, signOut } = useContext(AuthContext)


  useEffect(() => {
    api.get('/me')
      .then(response => console.log(response))
      .catch(error => console.log(error))
  })

  return (
    <>
      <h1>Dashboard: {user?.name}</h1>

      <button onClick={signOut}>SignOut</button>
      <Can permissions = {['metrics.list']}>
        <div>Métricas </div> 
      </Can>
    </>
  );
}

export const getServerSideProps = withSSRAuth(async (ctx) => {

  const apiClient = setupAPIClient(ctx)
  const response = await apiClient.get('/me')

  return {
    props: {}
  }

})