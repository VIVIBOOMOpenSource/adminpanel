import React from 'react';
import Logo from 'src/css/imgs/VIVITA-ph-logo.png';
import './user-registration-pdf-ph.scss';

function UserRegistrationPDF({
  user, signatureUrls, verifiedBy,
}) {
  return (
    <div className="create-user-pdf-ph" id="create-user-pdf-ph">
      <div className="logo">
        <img src={Logo} alt="" />
      </div>
      <div className="agreement-body">
        <div className="title">VIVITA Membership Terms & Conditions</div>
        <div className="subtitle">
          <p className="text">
            VIVITA Philippines Corp. is located at 1 Yangco Road cor. Brent Road, Upper General Luna, Baguio City, Philippines, 2600 (hereinafter "VIVITA").
          </p>
          <p className="text">
            VIVITA Philippines Corp. is represented by its Country Manager, Mr. Gabriel Antonio Mercado, who on behalf of VIVITA signs these membership terms.
          </p>
        </div>

        <div className="tables">
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
                  Date of birth:
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

          <div className="table-title">Guardian's data:</div>
          <div className="table">
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
          <p className="subsection-title">As a Guardian, I consent to the following:</p>
          <div className="texts">
            <div className="row">
              <div className="tick">✓</div>
              <div className="text">
                I give the consent to VIVITA to photograph and film my child during the activities in VIVITA creative learning environment,
                and to use these in VIVITA communication and marketing activities (including social media)
              </div>
            </div>
            <div className="row">
              <div className="tick">✓</div>
              <div className="text">
                I agree to the Internal Rules of VIVISTOP studio and have read and agree to the Privacy Policy
              </div>
            </div>
            <div className="row">
              <div className="tick">✓</div>
              <div className="text">
                By signing the Membership Terms and Conditions, I agree to the terms and conditions of VIVITA Creativity Accelerator
              </div>
            </div>
          </div>
        </div>
        <div className="signature-ctn">
          <div className="signatures">
            <div className="signature">
              <div className="name-and-signature">
                <div className="guardian-name">{user?.guardianName}</div>
                <img src={signatureUrls?.guardian} alt="" />
              </div>
              <div className="text">Guardian&apos;s Name and Signature</div>
              <div className="date-signed">
                <div className="subtitle">Date Signed:</div>
                <div className="date">{new Date().toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserRegistrationPDF;
