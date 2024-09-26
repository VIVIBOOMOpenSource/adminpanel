import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';
import FormSG from './user-registration-forms/user-registration-form-sg';
import FormPH from './user-registration-forms/user-registration-form-ph';
import FormEE from './user-registration-forms/user-registration-form-ee';
import FormLT from './user-registration-forms/user-registration-form-lt';
import FormNZ from './user-registration-forms/user-registration-form-nz';
import FormUS from './user-registration-forms/user-registration-form-us';

function UserRegistrationForm({ authToCreate }) {
  const branch = useSelector((state) => state.branch);
  const params = useParams();

  const registrationForm = useMemo(() => {
    if (!(branch.institutionId === 1)) return null;
    switch (branch.countryISO) {
      case 'SG':
        return <FormSG authToCreate={authToCreate} userId={params.userId} />;
      case 'PH':
        return <FormPH authToCreate={authToCreate} userId={params.userId} />;
      case 'EE':
        return <FormEE authToCreate={authToCreate} userId={params.userId} />;
      case 'US':
        return <FormUS authToCreate={authToCreate} userId={params.userId} />;
      case 'NZ':
        return <FormNZ authToCreate={authToCreate} userId={params.userId} />;
      case 'LT':
        return <FormLT authToCreate={authToCreate} userId={params.userId} />;
      default:
        return (
          <h3>
            This functionality is not available yet for
            {' '}
            {branch.name}
          </h3>
        );
    }
  }, [authToCreate, branch.countryISO, branch.institutionId, branch.name, params.userId]);

  return registrationForm;
}

export default UserRegistrationForm;
