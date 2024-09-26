import React from 'react';
import { useSelector } from 'react-redux';
import './user-registration-pdf-lt.scss';

const relationshipLt = {
  father: 'tėvas',
  mother: 'motina',
  legal_guardian: 'teisėtas globėjas',
};

function UserRegistrationPDF({
  user, signatureUrls, verifiedBy, branchInfo,
}) {
  const branch = useSelector((state) => state.branch);
  return (
    <div className="create-user-pdf-lt" id="create-user-pdf-lt">
      <div className="header">
        <b>VIVINAUTO SUTARTIS</b>
      </div>
      <div className="agreement-body">
        <div className="tables">
          <div className="table">
            <div className="table-row">
              <div className="field">
                <div className="field-name">
                  VIVITA subjekto pavadinimas:
                </div>
                <div className="field-value">
                  {branchInfo?.entityName || 'N.A.'}
                </div>
              </div>
            </div>
            {branch.countryISO !== 'US' && (
              <div className="table-row">
                <div className="field">
                  <div className="field-name">
                    Registro kodas / numeris:
                  </div>
                  <div className="field-value">
                    {branchInfo?.registryCode || 'N.A.'}
                  </div>
                </div>
              </div>
            )}
            <div className="table-row">
              <div className="field">
                <div className="field-name address">
                  Adresas:
                </div>
                <div className="field-value address">
                  {branchInfo?.address || 'N.A.'}
                </div>
              </div>
            </div>
            <div className="table-row">
              <div className="field">
                <div className="field-name">
                  Studija:
                </div>
                <div className="field-value">
                  {branchInfo?.studio || 'N.A.'}
                </div>
              </div>
            </div>
            <div className="table-row">
              <div className="field">
                <div className="field-name">
                  El. pašto adresas:
                </div>
                <div className="field-value">
                  {branchInfo?.email || 'N.A.'}
                </div>
              </div>
            </div>
          </div>

          <div className="table-title">Vaiko duomenys:</div>
          <div className="table">
            <div className="table-row">
              <div className="field">
                <div className="field-name">
                  Vardas ir pavardė:
                </div>
                <div className="field-value">
                  {user?.givenName}
                  {' '}
                  {user?.familyName}
                </div>
              </div>
            </div>
            <div className="table-row">
              <div className="field">
                <div className="field-name">
                  Gimimo data:
                </div>
                <div className="field-value">
                  {new Date(user?.dob).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="table-row">
              <div className="field">
                <div className="field-name">
                  Telefono numeris:
                </div>
                <div className="field-value">
                  {user?.phone || 'N.A.'}
                </div>
              </div>
            </div>
            <div className="table-row">
              <div className="field">
                <div className="field-name">
                  Adresas:
                </div>
                <div className="field-value">
                  {user?.address || ''}
                </div>
              </div>
            </div>
            <div className="table-row">
              <div className="field">
                <div className="field-name">
                  El. pašto adresas:
                </div>
                <div className="field-value">
                  {user?.email || 'N.A.'}
                </div>
              </div>
            </div>
            <div className="table-row">
              <div className="field">
                <div className="field-name">
                  Mokykla:
                </div>
                <div className="field-value">
                  {user?.school}
                </div>
              </div>
            </div>
          </div>

          <div className="table-title">Globėjų / tėvų duomenys:</div>
          <div className="table">
            <div className="table-row">
              <div className="field">
                <div className="field-name">
                  Santykis su vaiku:
                </div>
                <div className="field-value">
                  {relationshipLt[user?.guardianRelationship]}
                </div>
              </div>
            </div>
            <div className="table-row">
              <div className="field">
                <div className="field-name">
                  Vardas ir pavardė:
                </div>
                <div className="field-value">
                  {user?.guardianName}
                </div>
              </div>
            </div>
            <div className="table-row">
              <div className="field">
                <div className="field-name">
                  El. pašto adresas:
                </div>
                <div className="field-value">
                  {user?.guardianEmail}
                </div>
              </div>
            </div>
            <div className="table-row">
              <div className="field">
                <div className="field-name">
                  Telefono numeris:
                </div>
                <div className="field-value">
                  {user?.guardianPhone}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="agreements">
          <p className="subsection-title">
            Aš, kaip globėjas / tėvas,
            {' '}
            <b>sutinku</b>
            {' '}
            su šiais dalykais:
            {' '}
          </p>
          <div className="texts">
            <div className="row">
              <div className="bullet">-</div>
              <div className="text">
                Perskaičiau
                {' '}
                <b>VIVITA narystės sąlygas ir su jomis</b>
                {' '}
                sutinku.
              </div>
            </div>
            <div className="row">
              <div className="bullet">-</div>
              <div className="text">
                Perskaičiau ir sutinku su
                {' '}
                <b>VIVITA vidaus taisyklėmis dėl internetinių paslaugų</b>
                {' '}
                ir su
                {' '}
                <b>privatumo politika</b>
                .
              </div>
            </div>
            <div className="row">
              <div className="bullet">-</div>
              <div className="text">
                Sutinku ir leidžiu savo vaikui pradėti naudotis
                {' '}
                <b>VIVIBOOM švietimo portalu</b>
                .
              </div>
            </div>
            <div className="row">
              <div className="bullet">-</div>
              <div className="text">
                Perskaičiau ir sutinku su
                {' '}
                <b>atsakomybės atsisakymu</b>
                .
              </div>
            </div>
            <div className="row">
              <div className="bullet">-</div>
              <div className="text">
                Sutinku ir leidžiu
                {' '}
                <b>VIVITA fotografuoti ir (arba) filmuoti mano nepilnametį (-ius) vaiką (-us)</b>
                , dalyvaujantį (-čius) VIVITA seminaruose ir užsiėmimuose, ir sutinku, kad VIVITA šias nuotraukas ir (arba) filmuotą medžiagą skelbtų bet kokiu teisėtu būdu, įskaitant viešinimą, socialinę žiniasklaidą ir interneto turinį. Vaiko nuotrauka ar filmuota medžiaga
                {' '}
                <b>bus saugoma 5 metus</b>
                {' '}
                nuo nuotraukos ar vaizdo įrašo padarymo. Informacija apie jūsų teisę atšaukti sutikimą bei kitas teises pateikiama noi VIVITA privatumo pranešime.
              </div>
            </div>
            <div className="row">
              <div className="bullet">-</div>
              <div className="text">
                Sutinku
                {' '}
                <b>gauti pranešimus ir informaciją apie VIVITA veiklą bei organizuojamus renginius</b>
                .
                {' '}
                Informacija apie jūsų teisę atšaukti sutikimą bei kitas teises pateikiama VIVITA privatumo pranešime.
              </div>
            </div>
          </div>
        </div>
        <div className="subtitle">
          <p className="text">
            Pasirašydamas toliau patvirtinu, kad: (1) perskaičiau šį dokumentą, jį suprantu ir pasirašau savanoriškai ir be jokių įkalbinėjimų; (2) man yra ne mažiau kaip 18 metų ir esu veiksnus; ir (3) esu pirmiau išvardytų nepilnamečių vaikų teisėtas globėjas ir pasirašau šią sutartį jų vardu. Taip pat patvirtinu, kad: (4) pirmiau nurodytas (-i) nepilnametis (-iai) vaikas (-ai) yra sveikas (-i) ir neturi jokių sveikatos sutrikimų, kurie trukdytų jam (jiems) saugiai dalyvauti VIVITA veikloje, ir (5) pirmiau nurodytas (-i) nepilnametis (-iai) vaikas (-ai) yra ne jaunesnis (-i) kaip devynerių metų. Šioms Narystės taisyklėms ir sąlygoms taikomi ir jos aiškinamos pagal
            {' '}
            {branchInfo.jurisdiction}
            {' '}
            įstatymus.
          </p>
        </div>
        <div className="signature-ctn">
          <div className="signatures">
            <div className="signature">
              <div className="name-and-signature">
                <div className="subtitle">
                  Tėvų / globėjų vardas ir pavardė:
                </div>
                <div className="guardianName">
                  {user?.guardianName}
                </div>
              </div>
              <div className="name-and-signature">
                <div className="signature">Parašas: </div>
                <img
                  src={signatureUrls?.guardian}
                  alt=""
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserRegistrationPDF;
