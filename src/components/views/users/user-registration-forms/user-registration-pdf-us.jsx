import React from 'react';
import './user-registration-pdf-us.scss';

function UserRegistrationPDF({
  user, signatureUrls, verifiedBy, branchInfo,
}) {
  return (
    <div className="create-user-pdf-us" id="create-user-pdf-us">
      <div className="header">
        <b>VIVINAUT AGREEMENT</b>
      </div>
      <div className="agreement-body">
        <div className="tables">
          <div className="table">
            <div className="table-row">
              <div className="field">
                <div className="field-name">
                  Name of VIVITA Entity:
                </div>
                <div className="field-value">
                  {branchInfo?.entityName || 'N.A.'}
                </div>
              </div>
            </div>
            <div className="table-row">
              <div className="field">
                <div className="field-name address">
                  Address:
                </div>
                <div className="field-value address">
                  {branchInfo?.address || 'N.A.'}
                </div>
              </div>
            </div>
            <div className="table-row">
              <div className="field">
                <div className="field-name">
                  Studio:
                </div>
                <div className="field-value">
                  {branchInfo?.studio || 'N.A.'}
                </div>
              </div>
            </div>
            <div className="table-row">
              <div className="field">
                <div className="field-name">
                  E-mail Address:
                </div>
                <div className="field-value">
                  {branchInfo?.email || 'N.A.'}
                </div>
              </div>
            </div>
          </div>

          <div className="table-title">Child's data:</div>
          <div className="table">
            <div className="table-row">
              <div className="field">
                <div className="field-name">
                  Full name:
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
                  Personal Identification code / Date of birth:
                </div>
                <div className="field-value">
                  {new Date(user?.dob).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="table-row">
              <div className="field">
                <div className="field-name">
                  Phone number:
                </div>
                <div className="field-value">
                  {user?.phone || 'N.A.'}
                </div>
              </div>
            </div>
            <div className="table-row">
              <div className="field">
                <div className="field-name">
                  Address:
                </div>
                <div className="field-value">
                  {user?.address || ''}
                </div>
              </div>
            </div>
            <div className="table-row">
              <div className="field">
                <div className="field-name">
                  E-mail Address:
                </div>
                <div className="field-value">
                  {user?.email || 'N.A.'}
                </div>
              </div>
            </div>
            <div className="table-row">
              <div className="field">
                <div className="field-name">
                  School:
                </div>
                <div className="field-value">
                  {user?.school}
                </div>
              </div>
            </div>
          </div>

          <div className="table-title">Guardian / Parent data:</div>
          <div className="table">
            <div className="table-row">
              <div className="field">
                <div className="field-name">
                  Relationship to Child:
                </div>
                <div className="field-value">
                  {user?.guardianRelationship}
                </div>
              </div>
            </div>
            <div className="table-row">
              <div className="field">
                <div className="field-name">
                  Full name:
                </div>
                <div className="field-value">
                  {user?.guardianName}
                </div>
              </div>
            </div>
            <div className="table-row">
              <div className="field">
                <div className="field-name">
                  E-mail address:
                </div>
                <div className="field-value">
                  {user?.guardianEmail}
                </div>
              </div>
            </div>
            <div className="table-row">
              <div className="field">
                <div className="field-name">
                  Phone number:
                </div>
                <div className="field-value">
                  {user?.guardianPhone}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="agreements">
          <p className="subsection-title">As a Guardian / Parent, I consent and/or agree to the following:</p>
          <div className="texts">
            <div className="row">
              <div className="bullet">-</div>
              <div className="text">
                I have read and agree to the
                {' '}
                <b>VIVITA Membership Terms and Conditions</b>
                .
              </div>
            </div>
            <div className="row">
              <div className="bullet">-</div>
              <div className="text">
                I have read and agree to
                {' '}
                <b>VIVITA's Internal Rules regarding online services</b>
                {' '}
                and to the
                {' '}
                <b>Privacy Policy</b>
                .
              </div>
            </div>
            <div className="row">
              <div className="bullet">-</div>
              <div className="text">
                I consent and give permission for my Child to start using the
                {' '}
                <b>VIVIBOOM educational portal</b>
                .
              </div>
            </div>
            <div className="row">
              <div className="bullet">-</div>
              <div className="text">
                I have read and agree to the
                {' '}
                <b>Liability Waiver and Release</b>
                .
              </div>
            </div>
            <div className="row">
              <div className="bullet">-</div>
              <div className="text">
                I consent and give permission to VIVITA to take photographs and/or video of my minor child(ren) while participating in VIVITA's workshops and activities, and consent to the publication of these photographs and/or video by VIVITA for any legal use, including for publicity, social media, and web content.
              </div>
            </div>
            <div className="row">
              <div className="bullet">-</div>
              <div className="text">
                I agree that third parties such as companies and individuals who collaborate with us for projects, workshops, etc will shoot pictures and videos and release them on social medias and other platforms.
              </div>
            </div>
          </div>
        </div>
        <div className="subtitle">
          <p className="text">
            By signing below, I am certifying that: (1) I have read this document, understand it, and sign voluntarily and without any inducement; (2) I am at least 18 years of age and am of sound mind; and (3) I am the legal guardian of the minor child(ren) listed above and sign this Agreement on their behalf. I further certify that: (4) the minor child(ren) listed above is in good health and has no conditions or impairments which would preclude his/her safe participation in VIVITA's workshop and activities and (5) the minor child(ren) listed above is at least
            {' '}
            {branchInfo.minimumMembershipAge}
            {' '}
            years of age. These Membership Terms & Conditions shall be governed by and construed in accordance with the laws of the
            {' '}
            {branchInfo.jurisdiction}
            .
          </p>
        </div>
        <div className="signature-ctn">
          <div className="signatures">
            <div className="signature">
              <div className="name-and-signature">
                <div className="subtitle">
                  Name of Parent / Guardian:
                </div>
                <div className="guardianName">
                  {user?.guardianName}
                </div>
              </div>
              <div className="name-and-signature">
                <div className="signature">Signature: </div>
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
