import React from 'react';
import Logo from 'src/css/imgs/VIVITA-logo.png';
import './user-registration-pdf-sg.scss';

function CreateUserPDF({
  user, signatureUrls, verifiedBy,
}) {
  return (
    <div className="create-user-pdf-sg" id="create-user-pdf-sg">
      <div className="logo">
        <img src={Logo} alt="" />
      </div>
      <div className="agreement-body">
        <div className="title">VIVINAUT Agreement</div>
        <div className="subtitle">
          Member no.
          {' '}
          {user?.id || ''}
        </div>

        <div className="tables">
          <div className="table">
            <div className="table-header">
              VIVINAUT&apos;S PARTICULARS
            </div>
            <div className="table-row">
              <div className="field">
                <div className="field-name">
                  Given Name
                </div>
                <div className="field-value">
                  {user?.givenName}
                </div>
              </div>
              <div className="field">
                <div className="field-name">
                  Family Name
                </div>
                <div className="field-value">
                  {user?.familyName}
                </div>
              </div>
            </div>
            <div className="table-row">
              <div className="field">
                <div className="field-name">
                  Gender
                </div>
                <div className="field-value">
                  {user?.gender}
                </div>
              </div>
              <div className="field">
                <div className="field-name">
                  Date of birth
                </div>
                <div className="field-value">
                  {new Date(user?.dob).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="table-row">
              <div className="field">
                <div className="field-name">
                  Education Level
                </div>
                <div className="field-value">
                  {user?.educationLevel}
                </div>
              </div>
              <div className="field">
                <div className="field-name">
                  School
                </div>
                <div className="field-value">
                  {user?.school}
                </div>
              </div>
            </div>
            <div className="table-row">
              <div className="field">
                <div className="field-name">
                  Contact number
                </div>
                <div className="field-value">
                  {user?.phone}
                </div>
              </div>
              <div className="field">
                <div className="field-name">
                  Email address
                </div>
                <div className="field-value">
                  {user?.email}
                </div>
              </div>
            </div>
          </div>

          <div className="table">
            <div className="table-header">
              GUARDIAN&apos;S PARTICULARS
            </div>
            <div className="table-row">
              <div className="field">
                <div className="field-name">
                  Name
                </div>
                <div className="field-value">
                  {user?.guardianName}
                </div>
              </div>
              <div className="field">
                <div className="field-name">
                  Relationship
                </div>
                <div className="field-value">
                  {user?.guardianRelationship?.split('_').join(' ')}
                </div>
              </div>
            </div>
            <div className="table-row">
              <div className="field-address">
                <div className="field-name">
                  Residential Address
                </div>
                <div className="field-value">
                  {user?.address}
                </div>
              </div>
            </div>
            <div className="table-row">
              <div className="field">
                <div className="field-name">
                  Contact number
                </div>
                <div className="field-value">
                  {user?.guardianPhone}
                </div>
              </div>
              <div className="field">
                <div className="field-name">
                  Email address
                </div>
                <div className="field-value">
                  {user?.guardianEmail}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="second-title">Agreement to use VIVISTOP</div>
        <div className="policies">
          <div className="point">
            <p>1 Registration</p>
            <p className="text">Children who would like to access VIVISTOP will need to register as a &quot;VIVINAUT&quot;</p>
          </div>
          <div className="point">
            <p>
              2 Acceptance of VIVITA Membership Terms (the &quot;Membership Terms&quot;) and Privacy Notice (the &quot;Privacy Policy&quot;)
            </p>
            <p className="text">
              Before filling in this registration form, the Crew will share the Membership Terms and Privacy Policy with the Guardian.
            </p>
          </div>
          <div className="point">
            <p>
              3 Verification of Identity
            </p>
            <p className="text">
              Identification documents will be verified by the Crew for registration purposes. However, VIVITA will not retain any copies of
              the said identification documents.
            </p>
          </div>
        </div>
        <div className="agreements">
          <p className="subsection-title">By signing this agreement,</p>
          <p>
            I acknowledge that I have read and agree to the Membership Terms and the Privacy Policy.
          </p>
          <p>
            I acknowledge and agree to the photographing and filming of my child/ward during VIVITA activities and the use of the photos
            and videos to promote VIVITA&apos;s activities, including in social media.
          </p>
          <p>
            I confirm that the information stated above is true and correct and VIVITA is not liable for any incidents resulting from the
            provision of false information.
          </p>
        </div>
        <div className="signature-ctn">
          <p className="subsection-title">YES! I want to be a VIVINAUT!</p>
          <div className="signatures">
            <div className="signature">
              <img src={signatureUrls?.member} alt="" />
              <div className="text">Member&apos;s Signature</div>
            </div>
            <div className="signature">
              <img src={signatureUrls?.guardian} alt="" />
              <div className="text">Guardian&apos;s Signature</div>
            </div>
            <div className="signature">
              <div className="date">
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              <div className="text">Date</div>
            </div>
          </div>
        </div>
        <div className="verify">
          Verified By:
          {' '}
          {verifiedBy}
        </div>
        <div className="footer">
          <p>VIVITA Singapore Pte. Ltd. (UEN No. 201840507N)</p>
          <p>10 Kampong Eunos, Singapore 417775</p>
        </div>
      </div>
    </div>
  );
}

export default CreateUserPDF;
